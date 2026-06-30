import "dotenv/config";
import express from "express";
import { logActivity } from "../Utils/logger.js";
import {
    getRoas,
    checkExistingRoas,
    rpkiCreate,
    rpkiDelete
} from "../Controllers/rpkiController.js";

const router = express.Router();

/* ==========================================
   CHECK FOR EXISTING ROAs
========================================== */

router.get("/rpkicheck", async (req, res) => {
    const ips = req.query.ips.split(",");
    const org = req.query.org;

    if (!org) return res.status(400).json({ error: "Org handle is required" });

    try {
        const checks = await checkExistingRoas(ips, undefined, org);
        res.json({ result: checks });
    } catch (err) {
        res.status(500).json({ error: "Backend Error" });
    }
});

/* ==========================================
   CREATE ROA
========================================== */

router.get("/rpkicreate", async (req, res) => {
    const start = Date.now();
    const ips = req.query.ips.split(",");
    const asn = req.query.asn;
    const roa = req.query.roa;
    const org = req.query.org;

    if (!org) {
        return res.status(400).json({ error: "Org handle is required" });
    }

    try {
        const results = await rpkiCreate(ips, asn, roa, org);

        try {
            logActivity({
                user: req.session?.user?.username ?? "unknown",
                tool: "RPKI",
                action: "Create",
                type: ips.length > 1 ? "Bulk" : "Single",
                input: ips,
                asn,
                roaLength: roa,
                org,
                status: "Completed",
                result: {
                    success: results.filter(r => r.success).length,
                    failed: results.filter(r => !r.success).length
                },
                duration: Date.now() - start
            });
        } catch (logErr) {
            console.error("Logging failed:", logErr);
        }

        res.json({
            result: results.map(r => ({
                subnet: r.ip,
                message: r.success ? { success: true } : { error: r.raw }
            }))
        });

    } catch (err) {
        logActivity({
            user: req.session.user.username,
            tool: "RPKI",
            action: "Create",
            type: ips.length > 1 ? "Bulk" : "Single",
            input: ips,
            asn,
            roaLength: roa,
            org,
            status: "Failed",
            result: {
                success: 0,
                failed: ips.length
            },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({
            error: "Backend Error"
        });
    }
});


/* ==========================================
   DELETE ROA
========================================== */

router.get("/rpkidelete", async (req, res) => {

    const start = Date.now();

    const ips = req.query.ips.split(",");
    const asn = req.query.asn;
    const org = req.query.org;

    if (!org) {
        return res.status(400).json({
            error: "Org handle is required"
        });
    }

    try {
        const roas = await getRoas(org);
        const matched = roas.filter(r =>
            ips.includes(`${r.startAddress}/${r.cidrLength}`) &&
            String(r.asNumber) === String(asn)
        );

        const handles = matched.map(r => r.roaHandle);
        await rpkiDelete(handles, org);

        logActivity({
            user: req.session.user.username,
            tool: "RPKI",
            action: "Delete",
            type: ips.length > 1 ? "Bulk" : "Single",
            input: ips,
            asn,
            org,
            deletedHandles: handles,
            status: "Completed",
            result: {
                success: matched.length,
                failed: ips.length - matched.length
            },
            duration: Date.now() - start
        });
        res.json({
            result: matched.map(r => ({
                subnet: `${r.startAddress}/${r.cidrLength}`,
                message: "Deleted"
            }))
        });

    } catch (err) {
        logActivity({
            user: req.session.user.username,
            tool: "RPKI",
            action: "Delete",
            type: ips.length > 1 ? "Bulk" : "Single",
            input: ips,
            asn,
            org,
            status: "Failed",
            result: {
                success: 0,
                failed: ips.length
            },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({
            error: "Backend Error"
        });
    }
});

export default router;