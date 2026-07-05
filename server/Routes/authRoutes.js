import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { users } from "../users.js";
import { requireAuth } from "../Middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_MAX_AGE = 1000 * 60 * 60 * 8; // 8 hours

/* ---------------- LOGIN PAGE ---------------- */
router.get("/", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect("/dashboard");
        } catch (err) {
            // invalid/expired token, fall through to login page
        }
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

    const token = jwt.sign(
        { username: user.username, name: user.name },
        JWT_SECRET,
        { expiresIn: "8h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TOKEN_MAX_AGE
    });

    res.json({ success: true });
});

/* ---------------- DASHBOARD ---------------- */
router.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../../protected/index.html"));
});

/* ---------------- LOGOUT ---------------- */
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

export default router;