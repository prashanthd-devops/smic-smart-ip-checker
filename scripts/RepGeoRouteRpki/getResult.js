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
                <td colspan="3" style="text-align:center; padding:8px; border:1px solid black;">
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
        resultView.style.cssText = "margin-top:20px; padding:0 20px;";
        resultView.innerHTML = `
            <table style="border-collapse:collapse; width:50%; margin:0 auto;">
                <thead>
                    <tr>
                        <th style="border:1px solid black; padding:8px;">IP</th>
                        <th style="border:1px solid black; padding:8px;">Domain</th>
                        <th style="border:1px solid black; padding:8px;">Removal</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <button id=clr-results style="margin-top:20px; border:1px solid white">Clear Results</button>
        `;

        document.querySelector("main").appendChild(resultView);

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

        document.querySelector("main").appendChild(resultView);

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
            document.querySelector("main").appendChild(resultView);
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

        document.querySelector("main").appendChild(resultView);

        document.querySelector("#clr-results").addEventListener("click", () => {
            document.querySelector(".result-div").remove();
        });
    }
}

/* ========================================================================== */

async function repCheck(value) {
    
    const [ip, cidr] = value.split('/');

    if(Number(cidr) < 24){
       throw new Error("Please enter a /24 or a smaller block");
       return;
    }

    const response = await fetch(
        // `http://localhost:5000/blacklistcheck?ip=${encodeURIComponent(value)}`
        `/blacklistcheck?ip=${encodeURIComponent(value)}`
    );


    if (!response.ok) {
        throw new Error("Backend Error");
    }

    return await response.json();
}

/* ========================================================================== */
async function geoCheck(value) {

    const response = await fetch(
        // `http://localhost:5000/geocheck?ip=${encodeURIComponent(value)}`
        `/geocheck?ip=${encodeURIComponent(value)}`
    );


    if (!response.ok) {
        throw new Error("Backend Error");
    }

    return await response.json();
}

/* ========================================================================== */
async function routeCheck(value) {

    const response = await fetch(
        // `http://localhost:5000/routecheck?subnet=${encodeURIComponent(value)}`
        `/routecheck?subnet=${encodeURIComponent(value)}`
    );


    if (!response.ok) {
        throw new Error("Backend Error");
    }

    return await response.json();
}