/* ==========================================
   Reputation API
========================================== */

async function repCheck(value) {
    const [, cidr] = value.split("/");
    if (Number(cidr) < 24) {
        throw new Error("Please enter a /24 or a smaller block.");
    }

    const response = await fetch(
        `/blacklistcheck?ip=${encodeURIComponent(value)}`
    );

    if (!response.ok) {
        throw new Error("Backend Error");
    }
    return await response.json();
}