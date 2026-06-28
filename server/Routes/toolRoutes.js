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
            user: req.session.user.username,
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
            user: req.session.user?.username || "Unknown",
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
            user: req.session.user.username,
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
            user: req.session.user?.username || "Unknown",
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
Route Validation
----------------------------------*/
router.get("/routecheck", async (req, res) => {

    const start = Date.now();
    const subnet = req.query.subnet;

    try {
        const routeResult = await routeValidate(subnet);
        logActivity({
            user: req.session.user.username,
            tool: "Route Validation",
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
        res.json({
            message: "success",
            result: routeResult
        });

    } catch (err) {
        logActivity({
            user: req.session.user?.username || "Unknown",
            tool: "Route Validation",
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

export default router;