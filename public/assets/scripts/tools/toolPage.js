function pageView(paramId) {

    updateState("dashboard", {
        activePage: paramId
    });

    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";

    let currPage = "";
    let description = "";
    let helpContent = "";

    switch (paramId) {

        case "rep":
            currPage = "IP Reputation Checker";
            description = "Verify an IP address against multiple DNS blacklist providers.";
            helpContent = `
                <h4>How to use</h4>
                <ul>
                    <li>Enter a single IPv4 addresse e.g. <code>45.38.0.1</code> or a subnet e.g. <code>45.38.0.0/24</code></li>
                    <li>Results are checked against multiple DNSBL providers</li>
                    <li>A <strong>Results</strong> shown here indicated that the IP appears on that blacklist</li>
                    <li>Can click <strong>Remove</strong> to take you to removal page or removal submission page</li>
                </ul>
            `;
        break;

        case "geo":
            currPage = "IP Geolocation";
            description = "Retrieve ASN, Organization and Country information.";
            helpContent = `
                <h4>How to use</h4>
                <ul>
                    <li>Enter a single IPv4 address e.g. <code>8.8.8.8</code></li>
                    <li>Returns Country, ASN and Organization from 4 providers</li>
                    <li>Providers: Maxmind, IPInfo, IP2Location, IPHub</li>
                </ul>
            `;
        break;

        case "route":
            currPage = "Route Validator";
            description = "Validate prefixes and origin ASNs using Internet Routing Registry.";
            helpContent = `
                <h4>How to use</h4>
                <ul>
                    <li>Enter one or more IPv4 prefixes, one per line e.g. <code>203.0.113.0/24</code></li>
                    <li>Results show BGP origin ASNs, RPKI status and IRR sources</li>
                    <li>RPKI status: <strong>VALID</strong> = ROA match, <strong>INVALID</strong> = mismatch, <strong>UNKNOWN</strong> = no ROA</li>
                    <li>Click the prefix link in results to view full details on IRR Explorer</li>
                </ul>
            `;
        break;

        default:
            return;
    }
 
    const inputField =
    paramId === "route"
        ? `<textarea
                id="${paramId}"
                class="ip-input route-textarea"
                rows="5"
                spellcheck="false"
                placeholder="203.0.113.0/24&#10;198.51.100.0/24"></textarea>`
        : paramId === "geo"
            ? `<input
                    id="${paramId}"
                    class="ip-input"
                    type="text"
                    placeholder="Enter an IP Address">`
            : `<input
                    id="${paramId}"
                    class="ip-input"
                    type="text"
                    placeholder="Enter IP Address / Prefix">`;
    
    document.querySelector(".main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card">
                <h1>${currPage}</h1>
                <p class="tool-description">
                    ${description}
                </p>
                <div class="tool-input">
                    ${inputField}
                    <button
                        id="query-btn"
                        class="primary-btn">
                        Query
                    </button>
                </div>
                <div class="tool-buttons">
                    <button
                        id="back-btn"
                        class="secondary-btn">
                        ← Dashboard
                    </button>
                    <button
                        id="clear-btn"
                        class="secondary-btn">
                        Clear
                    </button>
                </div>

                <div id="help-section" class="help-section">
                    ${helpContent}
                </div>

                <div id="result-section"></div>
            </div>
        </section>
    `;

    document
        .getElementById("query-btn")
        .addEventListener("click", () => {
            getResult(paramId);
        });

    document
        .getElementById("back-btn")
        .addEventListener("click", () => {
            updateState("dashboard", {
                activePage: null
            });
            location.reload();
        });

    document
        .getElementById("clear-btn")
        .addEventListener("click", () => {
            document.getElementById(paramId).value = "";
            document.getElementById("result-section").innerHTML = "";
            document.getElementById("help-section").style.display = "block";

            updateState(paramId, {
                input: "",
                result: null
            });
        });

    const state = getState();
    if (state[paramId]) {
        if (state[paramId].input) {
            document.getElementById(paramId).value = state[paramId].input;
        }
        if (state[paramId].result) {
            renderResult(state[paramId].result, paramId);
        }
    }

}