import fs from "fs";
import path from "path";

export function logActivity(activity) {

    const timestamp = new Date();
    const operationId = `OP-${Date.now()}`;

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