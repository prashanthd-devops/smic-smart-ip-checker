import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import ipConvertion from "./Controllers/bController.js";
import geoFeeds from "./Controllers/gController.js";
import routeValidate from "./Controllers/rController.js";
import { getRoas, rpkiDelete, rpkiCreate } from './Controllers/rpkiController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.get('/blacklistcheck', async (req, res) => {
    const subnet = req.query.ip;
    const ipList = await ipConvertion(subnet);
    ipList.length === 0 
    ? res.status(200).json({
        message: "success",
        result: "No BlackList Found"
      })
    : res.status(200).json({
        message: "success",
        result: ipList
      })
});

app.get('/geocheck', async (req, res) => {
    const ip = req.query.ip;
    const geoResult = await geoFeeds(ip);
    res.status(200).json({
        message: "success",
        result: geoResult
    })
});

app.get('/routecheck', async (req, res) => {
    const subnet = req.query.subnet;
    const routeResult = await routeValidate(subnet);
    res.status(200).json({
        message: "success",
        result: routeResult
    })
});

app.get('/rpkicreate', async (req, res) => {
    const ips = req.query.ips.split(',');
    const asn = req.query.asn;
    const roa = req.query.roa;
    const org = req.query.org;

    if (!org) {
        return res.status(400).json({ error: 'Org handle is required' });
    }

    try {
        const results = await rpkiCreate(ips, asn, roa, org);

        res.status(200).json({
            result: results.map(r => ({
                subnet: r.ip,
                message: r.success ? { success: true } : { error: r.raw }
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Backend error', detail: err.message });
    }
});

app.get('/rpkidelete', async (req, res) => {
    const ips = req.query.ips.split(',');
    const asn = req.query.asn;
    const org = req.query.org;  // from frontend

    if (!org) {
        return res.status(400).json({ error: 'Org handle is required' });
    }

    try {
        const roas = await getRoas(org);  // pass org here
        console.log('Matching against IPs:', ips, 'ASN:', asn, 'Org:', org);

        const matched = roas.filter(r =>
            ips.includes(`${r.startAddress}/${r.cidrLength}`) &&
            String(r.asNumber) === String(asn)
        );
        // Add this temporarily to debug
        console.log('Sample ROA:', roas.slice(0, 3));
        console.log('Looking for:', ips, 'ASN:', asn);
        console.log('Matched count:', matched.length);

        if (!matched.length) {
            return res.status(404).json({ error: 'No matching ROAs found' });
        }

        const roaHandles = matched.map(r => r.roaHandle);
        const result = await rpkiDelete(roaHandles, org);  // pass org here too

        res.status(200).json({
            result: matched.map(r => ({
                subnet: `${r.startAddress}/${r.cidrLength}`,
                message: result
            }))
        });

    } catch (err) {
        console.error('DELETE ERROR:', err);
        res.status(500).json({ error: 'Backend error', detail: err.message });
    }
});


app.listen(PORT,()=>{
  console.log(`server is running on http://localhost:${PORT}`);
})

