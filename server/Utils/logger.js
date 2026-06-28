import fs from "fs";
import path from "path";

export function logActivity(activity) {

    const timestamp = new Date();

    // "2026-06-28T20-46-05-292"  (colons replaced with dashes for filename safety)
    const readableTs = timestamp
        .toISOString()
        .replace(":", "-")   // after T
        .replace(":", "-")   // minutes
        .replace(".", "-");  // milliseconds
    const operationId = `OP-${readableTs}`;

    // folder name like 2026-06-28
    const folderName = timestamp.toISOString().split("T")[0];

    // logs/2026-06-28
    const logDir = path.join(
        process.cwd(),
        "logs",
        folderName
    );

    // folder if it doesn't exist
    fs.mkdirSync(logDir, {
        recursive: true
    });

    const log = {
        operationId,
        timestamp: timestamp.toISOString(),
        ...activity
    };

    const filePath = path.join(
        logDir,
        `${operationId}.json`
    );

    fs.writeFileSync(
        filePath,
        JSON.stringify(log, null, 4)
    );

    return operationId;
}