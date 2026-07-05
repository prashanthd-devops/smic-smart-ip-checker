import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import toolRoutes from "./Routes/toolRoutes.js";
import authRoutes from "./Routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

/* ---------------- STATIC FRONTEND ---------------- */
app.use(express.static(path.join(__dirname, "../public")));

/* ---------------- ROUTES ---------------- */
app.use(authRoutes);
app.use(toolRoutes);

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});