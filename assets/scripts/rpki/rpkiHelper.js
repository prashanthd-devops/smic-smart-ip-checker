// ==========================================
// Validate IPv4 Prefix List
// ==========================================

function validateInput(ipArr) {

    for (const prefix of ipArr) {
        const parts = prefix.trim().split("/");
        // Prefix/CIDR check
        if (parts.length !== 2) {
            alert(`${prefix} is missing a CIDR suffix (Example: /24).`);
            return false;
        }

        const ip = parts[0];
        const cidr = Number(parts[1]);
        // CIDR validation
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
            alert(`Invalid CIDR in "${prefix}".`);
            return false;
        }

        const octets = ip.split(".");
        // IPv4 validation
        if (octets.length !== 4) {
            alert(`${ip} is not a valid IPv4 address.`);
            return false;
        }

        for (const octet of octets) {
            const num = Number(octet);
            if (
                octet === "" ||
                isNaN(num) ||
                num < 0 ||
                num > 255
            ) {
                alert(`Invalid IPv4 address: ${ip}`);
                return false;
            }
        }
    }
    return true;
}