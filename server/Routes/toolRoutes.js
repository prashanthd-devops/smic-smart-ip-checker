import "dotenv/config";
import express from "express";
import { logActivity } from "../Utils/logger.js";
import { users } from "../users.js";
import ipConvertion from "../Controllers/bController.js";
import geoFeeds from "../Controllers/gController.js";
import routeValidate from "../Controllers/rController.js";

const router = express.Router();

/*----------------------------------
IP Reputation
----------------------------------*/
router.get("/blacklistcheck", async (req, res) => {

    const start = Date.now();
    const subnet = req.query.ip;

    try {
        const ipList = await ipConvertion(subnet);
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "IP Reputation",
            action: "Lookup",
            type: "Single",
            input: [subnet],
            status: "Completed",
            result: {
                success: 1,
                failed: 0
            },
            duration: Date.now() - start
        });
        res.status(200).json({
            message: "success",
            result: ipList.length === 0
                ? "No BlackList Found"
                : ipList
        });

    } catch (err) {
        logActivity({
            user: req.session.user?.username ?? "Unknown",
            tool: "IP Reputation",
            action: "Lookup",
            type: "Single",
            input: [subnet],
            status: "Failed",
            result: {
                success: 0,
                failed: 1
            },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({
            message: "Backend Error"
        });
    }
});

/*----------------------------------
Geolocation
----------------------------------*/
router.get("/geocheck", async (req, res) => {

    const start = Date.now();
    const ip = req.query.ip;

    try {
        const geoResult = await geoFeeds(ip);
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Geolocation",
            action: "Lookup",
            type: "Single",
            input: [ip],
            status: "Completed",
            result: {
                success: 1,
                failed: 0
            },
            duration: Date.now() - start
        });
        res.json({
            message: "success",
            result: geoResult
        });

    } catch (err) {
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Geolocation",
            action: "Lookup",
            type: "Single",
            input: [ip],
            status: "Failed",
            result: {
                success: 0,
                failed: 1
            },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({
            message: "Backend Error"
        });
    }
});

/*----------------------------------
Route Validation — Single
----------------------------------*/
router.get("/routecheck", async (req, res) => {

    const start = Date.now();
    const subnet = req.query.subnet;

    try {
        const routeResult = await routeValidate(subnet);
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Route Validation",
            action: "Lookup",
            type: "Single",
            input: [subnet],
            status: "Completed",
            result: { success: 1, failed: 0 },
            duration: Date.now() - start
        });
        res.json({ message: "success", result: routeResult });

    } catch (err) {
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Route Validation",
            action: "Lookup",
            type: "Single",
            input: [subnet],
            status: "Failed",
            result: { success: 0, failed: 1 },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({ message: "Backend Error" });
    }
});

/*----------------------------------
Route Validation — Bulk
----------------------------------*/
router.post("/routecheck/bulk", async (req, res) => {

    const start = Date.now();
    const { subnets } = req.body;

    if (!Array.isArray(subnets) || subnets.length === 0) {
        return res.status(400).json({ message: "No subnets provided" });
    }

    try {
        const results = await Promise.allSettled(
            subnets.map(subnet => routeValidate(subnet))
        );

        const result = results.map((r, i) =>
            r.status === "fulfilled"
                ? r.value
                : [{ prefix: subnets[i], error: r.reason?.message }]
        ).flat();

        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Route Validation",
            action: "Lookup",
            type: "Bulk",
            input: subnets,
            status: "Completed",
            result: { success: subnets.length, failed: 0 },
            duration: Date.now() - start
        });

        res.json({ message: "success", result });

    } catch (err) {
        logActivity({
            user: req.session?.user?.username ?? "unknown",
            tool: "Route Validation",
            action: "Lookup",
            type: "Bulk",
            input: subnets,
            status: "Failed",
            result: { success: 0, failed: subnets.length },
            error: err.message,
            duration: Date.now() - start
        });
        res.status(500).json({ message: "Backend Error" });
    }
});

export default router;