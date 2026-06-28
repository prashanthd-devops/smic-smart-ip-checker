/* ==========================================
   Route Validator API
========================================== */

async function routeCheck(value) {

    const lines = value
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    if (lines.length === 1) {
        const response = await fetch(
            `/routecheck?subnet=${encodeURIComponent(lines[0])}`
        );
        if (!response.ok) throw new Error("Backend Error");
        return await response.json();
    }

    const response = await fetch("/routecheck/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnets: lines })
    });

    if (!response.ok) throw new Error("Backend Error");
    return await response.json();
}