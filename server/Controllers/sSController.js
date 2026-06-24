// Controllers/swipSimpleController.js
import axios from "axios";

const ARIN_API_KEY = process.env.ARIN_API_KEY;
const ARIN_BASE    = "https://reg.arin.net/rest";
const SLEEP_MS     = 2000;

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ipToInt = (ip) =>
  ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);

const intToIp = (n) =>
  [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

const normalizeIP = (ip) => ip.split(".").map(Number).join(".");

const toStr = (d) => {
  if (!d) return "";
  if (typeof d === "string") return d;
  try { return d.toString(); } catch { return String(d); }
};

const pick = (str, re) => {
  try { return str.match(re)?.[1]; } catch { return undefined; }
};

const arinGet = (path, extra = {}) =>
  axios.get(`${ARIN_BASE}${path}?apikey=${ARIN_API_KEY}`, {
    headers: { Accept: "application/xml" },
    timeout: 20000,
    ...extra,
  });

const arinPost = (path, payload) =>
  axios.post(`${ARIN_BASE}${path}?apikey=${ARIN_API_KEY}`, payload, {
    headers: { "Content-Type": "application/xml" },
    timeout: 20000,
  });

const arinPut = (path, payload) =>
  axios.put(`${ARIN_BASE}${path}?apikey=${ARIN_API_KEY}`, payload, {
    headers: { "Content-Type": "application/xml" },
    timeout: 20000,
  });

const arinDelete = (path) =>
  axios.delete(`${ARIN_BASE}${path}?apikey=${ARIN_API_KEY}`, {
    timeout: 20000,
  });

// ── Main handler ─────────────────────────────────────────────────────────────

export const simpleSWIPUpdate = async (req, res) => {
  try {
    const { ipArray = [], confirmations = {} } = req.body;
    const responses = [];

    console.log("\n=== simpleSWIPUpdate ===");
    console.log("IPs:", ipArray);
    console.log("Confirmations:", confirmations);

    for (const ipEntry of ipArray) {
      const logs = [];
      console.log(`\n--- Processing: ${ipEntry} ---`);
      logs.push(`🚀 Processing ${ipEntry}…`);

      try {
        const [startIP, cidr] = ipEntry.split("/");
        const hostBits = Math.pow(2, 32 - parseInt(cidr, 10));
        const endIP    = intToIp(ipToInt(startIP) + hostBits - 1);
        const netHandle = `NET-${startIP.replace(/\./g, "-")}-1`;

        // ── STEP 1: Check existing NET ──────────────────────────────
        logs.push("🔍 Checking for active entries…");

        let existingNetData    = null;
        let existingBlock      = null;
        let existingCustHandle = null;

        try {
          const netResp = await arinGet(`/net/${netHandle}`);
          existingNetData = toStr(netResp.data);

          const start = pick(existingNetData, /<startAddress>(.*?)<\/startAddress>/);
          const len   = pick(existingNetData, /<cidrLength>(.*?)<\/cidrLength>/);
          if (start && len) existingBlock = `${normalizeIP(start)}/${len}`;

          existingCustHandle = pick(existingNetData, /<customerHandle>(.*?)<\/customerHandle>/);
          logs.push(`⚠️ Existing network found: ${existingBlock}`);

          // Ask for confirmation if not already answered
          if (!confirmations[ipEntry]) {
            console.log("Confirm required for", ipEntry);
            return res.json({
              status: "pending",
              responses: [
                {
                  ip: ipEntry,
                  logs,
                  confirmRequired: true,
                  existingBlock,
                  message: `Network ${existingBlock} already exists. Overwrite?`,
                },
              ],
            });
          }

          if (confirmations[ipEntry] === "no") {
            logs.push(`⏭️ Skipped ${ipEntry}`);
            responses.push({ ip: ipEntry, logs, cancelled: true });
            console.log("User skipped", ipEntry);
            continue;
          }

          // ── Delete existing NET ──────────────────────────────────
          logs.push("🗑️ Deleting old NET…");
          try {
            await arinDelete(`/net/${netHandle}`);
            logs.push(`✅ Deleted NET: ${netHandle}`);
            await sleep(SLEEP_MS);
          } catch (e) {
            const body = toStr(e.response?.data || e.message);
            logs.push(`⚠️ Delete NET issue: ${body}`);
          }

          // ── Delete existing customer if present ──────────────────
          if (existingCustHandle) {
            try {
              await arinDelete(`/customer/${existingCustHandle}`);
              logs.push(`✅ Deleted customer: ${existingCustHandle}`);
              await sleep(SLEEP_MS);
            } catch (e) {
              const body = toStr(e.response?.data || e.message);
              logs.push(`⚠️ Delete customer issue: ${body}`);
            }
          }
        } catch (err) {
          const errXml = toStr(err.response?.data || err.message);
          const code   = pick(errXml, /<code>(.*?)<\/code>/);
          if (code === "E_OBJECT_NOT_FOUND" || /not found/i.test(errXml)) {
            logs.push("ℹ️ No existing network found.");
          } else {
            logs.push(`❌ NET check failed: ${errXml || err.message}`);
            responses.push({ ip: ipEntry, logs, error: true });
            continue;
          }
        }

        // ── STEP 2: Get parent NET handle ───────────────────────────
        let parentNetHandle = null;
        try {
          await sleep(SLEEP_MS);
          const pResp = await arinGet(`/net/parentNet/${startIP}/${endIP}`);
          const pStr  = toStr(pResp.data);
          parentNetHandle = pick(pStr, /<handle>(.*?)<\/handle>/);
          if (!parentNetHandle) throw new Error("Handle missing in response");
          logs.push(`📡 Parent NET: ${parentNetHandle}`);
        } catch (err) {
          const errXml = toStr(err.response?.data || err.message);
          logs.push(`❌ Parent NET lookup failed: ${errXml || err.message}`);
          responses.push({ ip: ipEntry, logs, error: true });
          continue;
        }

        // ── STEP 3: Create customer record ──────────────────────────
        let customerHandle = null;
        try {
          await sleep(SLEEP_MS);
          const custPayload = `<customer xmlns="http://www.arin.net/regrws/core/v1">
                                    <customerName>Private Customer</customerName>
                                    <iso3166-1>
                                        <name>UNITED STATES</name>
                                        <code2>US</code2>
                                        <code3>USA</code3>
                                        <e164>1</e164>
                                    </iso3166-1>
                                    <streetAddress><line number="1">3223 Kenneth St</line></streetAddress>
                                    <city>Santa Clara</city>
                                    <iso3166-2>CA</iso3166-2>
                                    <postalCode>95054</postalCode>
                                    <parentOrgHandle>EGNL-1</parentOrgHandle>
                                    <privateCustomer>false</privateCustomer>
                                </customer>`;

          const cResp = await arinPost(`/net/${parentNetHandle}/customer`, custPayload);
          const cStr  = toStr(cResp.data);
          customerHandle = pick(cStr, /<handle>(.*?)<\/handle>/);
          if (!customerHandle) throw new Error("Customer handle missing");
          logs.push(`👤 Created customer: ${customerHandle}`);
        } catch (err) {
          const errXml = toStr(err.response?.data || err.message);
          logs.push(`❌ Customer creation failed: ${errXml || err.message}`);
          responses.push({ ip: ipEntry, logs, error: true });
          continue;
        }

        // ── STEP 4: Reassign NET ────────────────────────────────────
        try {
          await sleep(SLEEP_MS);
          const netName = `NET-${startIP.replace(/\./g, "-")}-1`;
          const netPayload = `<net xmlns="http://www.arin.net/regrws/core/v1">
                                <version>4</version>
                                <netBlocks>
                                    <netBlock>
                                    <type>S</type>
                                    <startAddress>${startIP}</startAddress>
                                    <endAddress>${endIP}</endAddress>
                                    <cidrLength>${cidr}</cidrLength>
                                    </netBlock>
                                </netBlocks>
                                <customerHandle>${customerHandle}</customerHandle>
                                <parentNetHandle>${parentNetHandle}</parentNetHandle>
                                <netName>${netName}</netName>
                            </net>`;

          await arinPut(`/net/${parentNetHandle}/reassign`, netPayload);
          logs.push(`🆕 NET updated: ${netName}`);
          logs.push("🎉 SWIP created successfully.");
          responses.push({ ip: ipEntry, logs });
        } catch (err) {
          const errXml = toStr(err.response?.data || err.message);
          logs.push(`❌ Reassignment failed: ${errXml || err.message}`);
          responses.push({ ip: ipEntry, logs, error: true });
        }

      } catch (err) {
        const msg = err.message || String(err);
        logs.push(`❌ Unexpected error: ${msg}`);
        console.error("Unexpected error for", ipEntry, err);
        responses.push({ ip: ipEntry, logs, error: true });
      }
    }

    return res.json({ status: "done", responses });

  } catch (fatal) {
    console.error("Fatal error in simpleSWIPUpdate:", fatal);
    return res.status(500).json({
      status: "error",
      responses: [{ ip: null, logs: [`Fatal: ${fatal.message}`], error: true }],
    });
  }
};