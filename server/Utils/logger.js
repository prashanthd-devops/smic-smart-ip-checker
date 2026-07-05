import fs from "fs";
import path from "path";

export function logActivity(activity) {

    const timestamp = new Date();

    // "YYYY-MM-DDT20-46-05-292"  (colons replaced with dashes for filename safety)
    const readableTs = timestamp
        .toISOString()
        .replace(":", "-")   // after T
        .replace(":", "-")   // minutes
        .replace(".", "-");  // milliseconds
    const operationId = `OP-${readableTs}`;

    // folder name like YYYY-MM-DD
    const folderName = timestamp.toISOString().split("T")[0];

    // logs/YYYY-MM-DD
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