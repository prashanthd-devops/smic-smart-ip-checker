// Reputation Result Render
function renderRep(value) {

    const rows = value.result === "No BlackList Found"
        ? `
            <tr>
                <td colspan="3" class="success-cell">
                    ✓ No blacklist found
                </td>
            </tr>
        `
        : value.result.map(item => `

            <tr>
                <td>${item.ip}</td>
                <td>${item.listedOn}</td>
                <td>
                    <a
                        href="${item.removalLink}"
                        target="_blank">
                        Remove
                    </a>
                </td>
            </tr>

        `).join("");



    const resultView = document.createElement("div");
    resultView.className = "result-div";
    resultView.innerHTML = `
        <div class="result-card">
            <h2 class="result-title">
                IP Reputation Results
            </h2>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>IP Address</th>
                            <th>Blacklist</th>
                            <th>Removal Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
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

    showResult(resultView);

    resultView
        .querySelector("#clr-results")
        .addEventListener("click", () => {

            resultView.remove();

        });

}

// Geolocation Result Render
function renderGeo(value) {

    const data = value.result;

    const providers = [
        "Maxmind",
        "Ipinfo",
        "Ip2location",
        "Iphub"
    ];

    const rows = providers.map(provider => `
        <tr>
            <td>
                ${provider}
            </td>
            <td>
                ${data[provider].country || "-"}
            </td>
            <td>
                ${data[provider].asn || "-"}
            </td>
            <td>
                ${data[provider].Org || "-"}
            </td>
        </tr>

    `).join("");

    const resultView = document.createElement("div");
    resultView.className = "result-div";
    resultView.innerHTML = `
        <div class="result-card">
            <h2 class="result-title">
                IP Geolocation Results
            </h2>
            <p class="result-subtitle">
                <strong>IP Address:</strong> ${data.ip}
            </p>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Provider</th>
                            <th>Country</th>
                            <th>ASN</th>
                            <th>Organization</th>
                        </tr>

                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
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

    showResult(resultView);

    resultView
        .querySelector("#clr-results")
        .addEventListener("click", () => {

            resultView.remove();

        });
}

// Route Result Render
function renderRoute(value) {

    const data = value.result;

    const resultView = document.createElement("div");
    resultView.className = "result-div";

    if (data.error) {
        resultView.innerHTML = `
            <div class="result-card">
                <h2 class="result-title">
                    Route Validation
                </h2>
                <div class="error-box">
                    ${data.error}
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

        showResult(resultView);

        resultView
            .querySelector("#clr-results")
            .onclick = () => resultView.remove();

        return;
    }

    const rows = data.map(entry => {
        const bgp =
            entry.bgpOrigins.length
                ? entry.bgpOrigins.map(asn => `AS${asn}`).join(", ")
                : "—";

        const rpki =
            entry.rpkiRoutes.length
                ? entry.rpkiRoutes.map(route => {

                    const cls =
                        route.rpkiStatus === "VALID"
                            ? "badge-success"
                            : route.rpkiStatus === "INVALID"
                            ? "badge-danger"
                            : "badge-warning";

                    return `
                        <span class="${cls}">
                            ${route.rpkiStatus}
                        </span>
                        AS${route.asn}
                    `;

                }).join("<br>")
                : `<span class="badge-secondary">None</span>`;

        const irr =
            Object.keys(entry.irrRoutes || {}).join(", ") || "—";

        const adviceClass =
            entry.categoryOverall === "success"
                ? "text-success"
                : entry.categoryOverall === "warning"
                ? "text-warning"
                : "text-danger";

        const advice =
            entry.messages
                .map(msg => msg.text)
                .join(" ");

        return `
            <tr>
                <td>
                    <a
                        href="https://irrexplorer.nlnog.net/prefix/${entry.prefix}"
                        target="_blank">

                        ${entry.prefix}
                    </a>
                </td>
                <td>${entry.rir}</td>
                <td>${bgp}</td>
                <td>${rpki}</td>
                <td>${irr}</td>
                <td class="${adviceClass}">
                    ${advice}
                </td>
            </tr>
        `;
    }).join("");

    resultView.innerHTML = `
        <div class="result-card result-wide">
            <h2 class="result-title">
                Route Validation Results
            </h2>

            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Prefix</th>
                            <th>RIR</th>
                            <th>BGP Origin</th>
                            <th>RPKI</th>
                            <th>IRR Source</th>
                            <th>Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
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

    showResult(resultView);

    resultView
        .querySelector("#clr-results")
        .onclick = () => resultView.remove();

}