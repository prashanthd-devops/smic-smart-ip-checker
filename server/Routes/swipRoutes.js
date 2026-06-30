import "dotenv/config";
import express from "express";
import { detailedSWIPUpdate } from "../Controllers/sDController.js";
import { simpleSWIPUpdate } from "../Controllers/sSController.js";
import { logActivity } from "../Utils/logger.js";
import { requireAuthApi } from "../Middleware/auth.js";

const router = express.Router();

router.use(requireAuthApi);

/* ==========================================
   SIMPLE SWIP
========================================== */

router.post("/swip/simple", async (req, res) => {

    const start = Date.now();
    try {
        await simpleSWIPUpdate(req, res);
        logActivity({
            user: req.user.username,
            tool: "SWIP",
            action: "Simple SWIP",
            type: req.body.records?.length > 1 ? "Bulk" : "Single",
            input: req.body.records || [],
            status: "Completed",
            result: {
                success: req.body.records?.length || 1,
                failed: 0
            },
            duration: Date.now() - start
        });

    } catch (err) {
        logActivity({
            user: req.user.username,
            tool: "SWIP",
            action: "Simple SWIP",
            type: req.body.records?.length > 1 ? "Bulk" : "Single",
            input: req.body.records || [],
            status: "Failed",
            result: {
                success: 0,
                failed: req.body.records?.length || 1
            },
            error: err.message,
            duration: Date.now() - start
        });
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
});


/* ==========================================
   DETAILED SWIP
========================================== */

router.post("/swip/detailed", async (req, res) => {
    const start = Date.now();

    try {
        await detailedSWIPUpdate(req, res);
        logActivity({
            user: req.user.username,
            tool: "SWIP",
            action: "Detailed SWIP",
            type: req.body.records?.length > 1 ? "Bulk" : "Single",
            input: req.body.records || [],
            status: "Completed",
            result: {
                success: req.body.records?.length || 1,
                failed: 0
            },
            duration: Date.now() - start
        });

    } catch (err) {
        logActivity({
            user: req.user.username,
            tool: "SWIP",
            action: "Detailed SWIP",
            type: req.body.records?.length > 1 ? "Bulk" : "Single",
            input: req.body.records || [],
            status: "Failed",
            result: {
                success: 0,
                failed: req.body.records?.length || 1
            },
            error: err.message,
            duration: Date.now() - start
        });
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
});

export default router;