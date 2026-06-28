async function getResult(paramId) {

    const input = document.getElementById(paramId);
    const value = input.value.trim();

    if (!value) {
        alert("Please enter an input.");
        input.focus();
        return;
    }

    const [ip] = value.split("/");
    const octets = ip.split(".");

    if (paramId === "route") {
        const lines = value.split("\n").map(l => l.trim()).filter(Boolean);
        if (!validateInput(lines)) return;
    } 
    else {
        const [ip] = value.split("/");
        const octets = ip.split(".");
        if(octets.length !== 4 || octets.some(o => isNaN(o) || Number(o) < 0 || Number(o) > 255)) {
            alert("Please enter a valid IPv4 address.");
            input.focus();
            return;
        }
    }

    const btn = document.getElementById("query-btn");

    btn.disabled = true;
    btn.innerHTML = "⏳ Fetching...";

    const spinner = document.createElement("div");
    spinner.className = "spinner-overlay";
    spinner.innerHTML = `<div class="spinner"></div>`;

    document.body.appendChild(spinner);

    try {
        const result = await getCallFunction(paramId, value);
        updateState(paramId, {
            input: document.getElementById(paramId).value,
            result: result
        });
        renderResult(result, paramId);
    }
    catch (err) {
        console.error(err);
        alert(err.message || "Unexpected error occurred.");
    }
    finally {
        spinner.remove();
        btn.disabled = false;
        btn.innerHTML = "Query";

    }

}


function getCallFunction(paramId, value) {

    switch (paramId) {

        case "rep":
            return repCheck(value);

        case "geo":
            return geoCheck(value);

        case "route":
            return routeCheck(value);

        default:
            throw new Error("Invalid Tool");

    }

}


function renderResult(response, paramId) {

    const help = document.getElementById("help-section");
    if (help) help.style.display = "none";

    switch (paramId) {
        case "rep":
            renderRep(response);
            break;
        case "geo":
            renderGeo(response);
            break;
        case "route":
            renderRoute(response);
            break;
    }
}


function showResult(resultView) {
    const resultSection = document.getElementById("result-section");
    resultSection.innerHTML = "";
    resultSection.appendChild(resultView);
}