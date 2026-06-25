/* ==========================================
   Route Validator API
========================================== */

async function routeCheck(value) {
    const response = await fetch(
        `/routecheck?subnet=${encodeURIComponent(value)}`
    );

    if (!response.ok) {
        throw new Error("Backend Error");
    }
    return await response.json();

}