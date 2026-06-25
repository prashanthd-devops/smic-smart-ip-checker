// Controllers/swipSimpleController.js
import axios from "axios";

const ARIN_API_KEY = process.env.ARIN_API_KEY;
const ARIN_BASE    = "https://reg.arin.net/rest";
const SLEEP_MS     = 2000;

// ── Utilities ─────────────────────────────────────────────────────────────────

const sleep    = (ms) => new Promise((r) => setTimeout(r, ms));
const toStr    = (d)  => (!d ? "" : typeof d === "string" ? d : String(d));
const pick     = (s, re) => { try { return s.match(re)?.[1]; } catch { return undefined; } };

const ipToInt  = (ip) =>
    ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);

const intToIp  = (n) =>
    [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

const normalizeIP = (ip) => ip.split(".").map(Number).join(".");

// ── ARIN HTTP wrappers ────────────────────────────────────────────────────────

const arinHeaders = { Accept: "application/xml" };
const arinOpts    = { timeout: 20000 };
const withKey     = (path) => `${ARIN_BASE}${path}?apikey=${ARIN_API_KEY}`;

const arinGet    = (path) =>
    axios.get(withKey(path), { headers: arinHeaders, ...arinOpts });

const arinPost   = (path, data) =>
    axios.post(withKey(path), data, {
        headers: { "Content-Type": "application/xml" },
        ...arinOpts
    });

const arinPut    = (path, data) =>
    axios.put(withKey(path), data, {
        headers: { "Content-Type": "application/xml" },
        ...arinOpts
    });

const arinDelete = (path) =>
    axios.delete(withKey(path), arinOpts);

// ── Error classifier ──────────────────────────────────────────────────────────

const isNotFound = (errXml) => {
    const code = pick(errXml, /<code>(.*?)<\/code>/);
    return code === "E_OBJECT_NOT_FOUND" || /not found/i.test(errXml);
};

// ── Main handler ──────────────────────────────────────────────────────────────

export const simpleSWIPUpdate = async (req, res) => {

    const { ipArray = [], confirmations = {} } = req.body;
    const responses = [];

    console.log("\n=== simpleSWIPUpdate ===");
    console.log("IPs:", ipArray, "| Confirmations:", confirmations);

    for (const ipEntry of ipArray) {

        const logs = [`🚀 Processing ${ipEntry}…`];
        const fail = (msg) => { logs.push(msg); responses.push({ ip: ipEntry, logs, status: "FAILED"    }); };
        const skip = (msg) => { logs.push(msg); responses.push({ ip: ipEntry, logs, status: "SKIPPED"   }); };
        const ok   = (msg) => { logs.push(msg); responses.push({ ip: ipEntry, logs, status: "SUCCESS"   }); };

        console.log(`\n--- Processing: ${ipEntry} ---`);

        try {
            const [startIP, cidr] = ipEntry.split("/");
            const hostBits  = Math.pow(2, 32 - parseInt(cidr, 10));
            const endIP     = intToIp(ipToInt(startIP) + hostBits - 1);
            const netHandle = `NET-${startIP.replace(/\./g, "-")}-1`;

            // ── Step 1: Check for existing NET ────────────────────────────────
            logs.push("🔍 Checking for active entries…");

            let existingBlock      = null;
            let existingCustHandle = null;

            try {
                const xml = toStr((await arinGet(`/net/${netHandle}`)).data);

                const start = pick(xml, /<startAddress>(.*?)<\/startAddress>/);
                const len   = pick(xml, /<cidrLength>(.*?)<\/cidrLength>/);
                if (start && len) existingBlock = `${normalizeIP(start)}/${len}`;

                existingCustHandle = pick(xml, /<customerHandle>(.*?)<\/customerHandle>/);
                logs.push(`⚠️ Existing network found: ${existingBlock}`);

                // No confirmation yet → pause and ask
                if (!confirmations[ipEntry]) {
                    return res.json({
                        status: "pending",
                        responses: [{
                            ip:            ipEntry,
                            logs,
                            confirmRequired: true,
                            existingBlock,
                            message: `Network ${existingBlock} already exists. Overwrite?`
                        }]
                    });
                }

                // User declined → skip
                if (confirmations[ipEntry] === "no") {
                    skip(`⏭️ Skipped ${ipEntry} — user declined.`);
                    continue;
                }

                // User confirmed → delete existing NET
                logs.push("🗑️ Deleting old NET…");
                try {
                    await arinDelete(`/net/${netHandle}`);
                    logs.push(`✅ Deleted NET: ${netHandle}`);
                    await sleep(SLEEP_MS);
                } catch (e) {
                    logs.push(`⚠️ Delete NET issue: ${toStr(e.response?.data || e.message)}`);
                }

                // Delete associated customer if present
                if (existingCustHandle) {
                    try {
                        await arinDelete(`/customer/${existingCustHandle}`);
                        logs.push(`✅ Deleted customer: ${existingCustHandle}`);
                        await sleep(SLEEP_MS);
                    } catch (e) {
                        logs.push(`⚠️ Delete customer issue: ${toStr(e.response?.data || e.message)}`);
                    }
                }

            } catch (err) {
                const errXml = toStr(err.response?.data || err.message);
                if (isNotFound(errXml)) {
                    logs.push("ℹ️ No existing network found.");
                } else {
                    fail(`❌ NET check failed: ${errXml || err.message}`);
                    continue;
                }
            }

            // ── Step 2: Get parent NET handle ─────────────────────────────────
            let parentNetHandle = null;
            try {
                await sleep(SLEEP_MS);
                const pXml = toStr((await arinGet(`/net/parentNet/${startIP}/${endIP}`)).data);
                parentNetHandle = pick(pXml, /<handle>(.*?)<\/handle>/);
                if (!parentNetHandle) throw new Error("Handle missing in response");
                logs.push(`📡 Parent NET: ${parentNetHandle}`);
            } catch (err) {
                fail(`❌ Parent NET lookup failed: ${toStr(err.response?.data || err.message)}`);
                continue;
            }

            // ── Step 3: Create customer record ────────────────────────────────
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

                const cXml = toStr((await arinPost(`/net/${parentNetHandle}/customer`, custPayload)).data);
                customerHandle = pick(cXml, /<handle>(.*?)<\/handle>/);
                if (!customerHandle) throw new Error("Customer handle missing in response");
                logs.push(`👤 Created customer: ${customerHandle}`);
            } catch (err) {
                fail(`❌ Customer creation failed: ${toStr(err.response?.data || err.message)}`);
                continue;
            }

            // ── Step 4: Reassign NET ──────────────────────────────────────────
            try {
                await sleep(SLEEP_MS);
                const netName    = `NET-${startIP.replace(/\./g, "-")}-1`;
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
                ok("🎉 SWIP created successfully.");

            } catch (err) {
                fail(`❌ Reassignment failed: ${toStr(err.response?.data || err.message)}`);
            }

        } catch (err) {
            console.error("Unexpected error for", ipEntry, err);
            fail(`❌ Unexpected error: ${err.message || String(err)}`);
        }
    }

    return res.json({ status: "done", responses });
};