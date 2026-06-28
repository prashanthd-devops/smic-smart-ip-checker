/* ==========================================
   Geo API
========================================== */

async function geoCheck(value) {
    const response = await fetch(
        `/geocheck?ip=${encodeURIComponent(value)}`
    );

    if (!response.ok) {
        throw new Error("Backend Error");
    }

    return await response.json();
}