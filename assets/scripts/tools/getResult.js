async function getResult(paramId) {
    const getIdValue = document.getElementById(paramId).value.trim();

    if (!getIdValue) {
        return alert("Please enter an input");
    }

    const [ip] = getIdValue.split('/');

    const validateValue = ip.split('.');

    if (
        validateValue.length !== 4 ||
        validateValue.some(v => isNaN(v) || Number(v) < 0 || Number(v) > 255)
    ) {
        return alert("Please enter a valid IPv4 address");
    }

    const btn = document.getElementById("query-btn");

    btn.disabled = true;
    btn.innerHTML = "⏳ Fetching...";

    const spinner = document.createElement("div");
    spinner.className = "spinner-overlay";
    spinner.innerHTML = `<div class="spinner"></div>`;

    document.body.appendChild(spinner);

    try {

        const response = await getCallFunction(paramId, getIdValue);
        console.log(response);

        renderResult(response,paramId);

    } catch (err) {

        console.error(err);
        alert(err.message || "An error occurred");

    } finally {

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
            throw new Error("Invalid operation");
    }
}

function renderResult(response,paramId){
    paramId === 'rep' ? renderRep(response) : 
    paramId === 'geo' ? renderGeo(response) : 
    paramId === 'route' ? renderRoute(response) : null;

    function renderRep(value) {

        const old = document.querySelector(".result-div");
        if (old) old.remove();

        const rows = value.result === "No BlackList Found"
            ? `<tr>
                <td colspan="3" style="text-align:center; padding:8px; border:1px solid white;">
                    ✓ No blacklist found
                </td>
            </tr>`
            : value.result.map(item => `
                <tr>
                    <td style="border:1px solid black; padding:8px;">${item.ip}</td>
                    <td style="border:1px solid black; padding:8px;">${item.listedOn}</td>
                    <td style="border:1px solid black; padding:8px;">
                        <a href="${item.removalLink}" target="_blank">Remove</a>
                    </td>
                </tr>
            `).join('');

        const resultView = document.createElement("div");
        resultView.className = "result-div";
        resultView.style.cssText = "margin-top:20px; padding:0 20px;border:1px solid white";
        resultView.innerHTML = `
                <div class="result-card">
                    <h2 class="result-title">
                        IP Reputation Results
                    </h2>
                    <div class="table-wrapper">
                        <table class="result-table">
                            ...
                        </table>
                    </div>

                    <div class="result-clear">
                        <button
                            id="clr-results"
                            class="secondary-btn">

                            Clear Results
                        </button>
                    </div>
                </div>
        `;

        const resultSection = document.getElementById("result-section");
        resultSection.innerHTML = "";
        resultSection.appendChild(resultView);

        document.querySelector("#clr-results").addEventListener("click",()=>{
            document.querySelector(".result-div").remove();
        })
    }

    function renderGeo(value) {

        const old = document.querySelector(".result-div");
        if (old) old.remove();

        const data = value.result;
        console.log("data:", data);
        const providers = ["Maxmind", "Ipinfo", "Ip2location", "Iphub"];

        const rows = providers.map(p => `
            <tr>
                <td style="border:1px solid black; padding:8px; font-weight:bold;">${p}</td>
                <td style="border:1px solid black; padding:8px;">${data[p].country}</td>
                <td style="border:1px solid black; padding:8px;">${data[p].asn}</td>
                <td style="border:1px solid black; padding:8px;">${data[p].Org}</td>
            </tr>
        `).join('');

        const resultView = document.createElement("div");
        resultView.className = "result-div";
        resultView.style.cssText = "margin-top:20px; padding:0 20px;";
        resultView.innerHTML = `
            <p style="text-align:center; margin-bottom:8px; font-weight:bold;">
                Results for: ${data.ip}
            </p>
            <table style="border-collapse:collapse; width:70%; margin:0 auto;">
                <thead>
                    <tr>
                        <th style="border:1px solid black; padding:8px;">Provider</th>
                        <th style="border:1px solid black; padding:8px;">Country</th>
                        <th style="border:1px solid black; padding:8px;">ASN</th>
                        <th style="border:1px solid black; padding:8px;">Org</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <button id=clr-results style="margin-top:20px; border:1px solid white">Clear Results</button>
        `;

        const resultSection = document.getElementById("result-section");
        resultSection.innerHTML = "";
        resultSection.appendChild(resultView);

        document.querySelector("#clr-results").addEventListener("click",()=>{
            document.querySelector(".result-div").remove();
        })
    }

    function renderRoute(value) {

        const old = document.querySelector(".result-div");
        if (old) old.remove();

        const data = value.result;

        // handle error
        if (data.error) {
            const resultView = document.createElement("div");
            resultView.className = "result-div";
            resultView.style.cssText = "margin-top:20px; padding:0 20px; text-align:center; color:red;";
            resultView.textContent = `Error: ${data.error}`;
            const resultSection = document.getElementById("result-section");
            resultSection.innerHTML = "";
            resultSection.appendChild(resultView);
            return;
        }

        const rows = data.map(entry => {

            // BGP origins — e.g. "9009 ▶/24"
            const bgp = entry.bgpOrigins
                .map(asn => `AS${asn}`)
                .join(", ") || "—";

            // RPKI — e.g. "VALID / AS6079"
            const rpki = entry.rpkiRoutes.length > 0
                ? entry.rpkiRoutes.map(r => `
                    <span style="color:${r.rpkiStatus === 'VALID' ? 'green' : 'red'}">
                        ${r.rpkiStatus} / AS${r.asn}
                    </span>`).join("<br>")
                : `<span style="color:gray;">None</span>`;

            // IRR sources — e.g. "RADB, ARIN"
            const irrSources = Object.keys(entry.irrRoutes || {}).join(", ") || "—";

            // Advice / message
            const adviceColor = 
                entry.categoryOverall === "success" ? "green" :
                entry.categoryOverall === "warning" ? "orange" : "red";

            const advice = entry.messages
                .map(m => m.text)
                .join(" ");

            return `
                <tr>
                    <td style="border:1px solid #ccc; padding:8px;">
                        <a href="https://irrexplorer.nlnog.net/prefix/${entry.prefix}" 
                        target="_blank" rel="noopener noreferrer"
                        style="color:#0066cc;">
                            ${entry.prefix}
                        </a>
                    </td>
                    <td style="border:1px solid #ccc; padding:8px;">${entry.rir}</td>
                    <td style="border:1px solid #ccc; padding:8px;">${bgp}</td>
                    <td style="border:1px solid #ccc; padding:8px;">${rpki}</td>
                    <td style="border:1px solid #ccc; padding:8px;">${irrSources}</td>
                    <td style="border:1px solid #ccc; padding:8px; color:${adviceColor};">
                        ${advice}
                    </td>
                </tr>
            `;
        }).join('');

        const resultView = document.createElement("div");
        resultView.className = "result-div";
        resultView.style.cssText = "margin-top:20px; padding:0 20px; overflow-x:auto;";
        resultView.innerHTML = `
            <table style="border-collapse:collapse; width:100%; font-size:13px;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">Prefix</th>
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">RIR</th>
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">BGP</th>
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">RPKI</th>
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">IRR</th>
                        <th style="border:1px solid #ccc; padding:8px; text-align:left;">Advice</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <div style="text-align:center; margin-top:12px;">
                <button id="clr-results" style="padding:6px 16px; cursor:pointer; border:1px solid white">Clear Results</button>
            </div>
        `;

        const resultSection = document.getElementById("result-section");
        resultSection.innerHTML = "";
        resultSection.appendChild(resultView);

        document.querySelector("#clr-results").addEventListener("click", () => {
            document.querySelector(".result-div").remove();
        });
    }
}

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

    if (
        octets.length !== 4 ||
        octets.some(o => isNaN(o) || Number(o) < 0 || Number(o) > 255)
    ) {
        alert("Please enter a valid IPv4 address.");
        input.focus();
        return;
    }

    const btn = document.getElementById("query-btn");

    btn.disabled = true;
    btn.innerHTML = "⏳ Fetching...";

    const spinner = document.createElement("div");
    spinner.className = "spinner-overlay";
    spinner.innerHTML = `<div class="spinner"></div>`;

    document.body.appendChild(spinner);

    try {
        const response = await getCallFunction(paramId, value);
        console.log(response);
        renderResult(response, paramId);
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