/* ==========================================
   Geo API
========================================== */

async function geoCheck(value) {
    const response = await fetch(
        `http://localhost:5000/geocheck?ip=${encodeURIComponent(value)}`
    );

    if (!response.ok) {
        throw new Error("Backend Error");
    }

    return await response.json();
}