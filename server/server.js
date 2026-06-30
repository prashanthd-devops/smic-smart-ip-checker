import "dotenv/config";

import session from "express-session";
import FileStoreFactory from "session-file-store";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import toolRoutes from "./Routes/toolRoutes.js";
import rpkiRoutes from "./Routes/rpkiRoutes.js";
import swipRoutes from "./Routes/swipRoutes.js";
import authRoutes from "./Routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const FileStore = FileStoreFactory(session);

app.use(session({
    store: new FileStore({ path: "./sessions" }),
    secret: "smart-ip-checker",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8
    }
}));

/* ---------------- STATIC FRONTEND ---------------- */
app.use(express.static(path.join(__dirname, "../public")));

/* ---------------- ROUTES ---------------- */
app.use(authRoutes);
app.use(toolRoutes);
app.use(rpkiRoutes);
app.use(swipRoutes);

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});