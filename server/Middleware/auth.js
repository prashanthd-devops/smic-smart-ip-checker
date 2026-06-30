import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect("/");

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/");
    }
}

// For API routes that should return JSON 401 instead of redirecting
export function requireAuthApi(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(401).json({ error: "Session expired" });
    }
}