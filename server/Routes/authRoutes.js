import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { users } from "../users.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- LOGIN PAGE ---------------- */
router.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    res.sendFile(path.join(__dirname, "../../public/login.html"));
});

/* ---------------- LOGIN API ---------------- */
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password."
        });
    }
    req.session.user = {
        username: user.username,
        name: user.name
    };
    res.json({ success: true });
});

/* ---------------- DASHBOARD ---------------- */
router.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "../../protected/index.html"));
});

/* ---------------- LOGOUT ---------------- */
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router;