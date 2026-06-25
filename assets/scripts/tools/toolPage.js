function pageView(paramId) {

    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";

    let currPage = "";
    let description = "";

    switch (paramId) {

        case "rep":
            currPage = "IP Reputation Checker";
            description =
                "Verify an IP address against multiple DNS blacklist providers.";
            break;

        case "geo":
            currPage = "IP Geolocation";
            description =
                "Retrieve ASN, Organization and Country information.";
            break;

        case "route":
            currPage = "Route Validator";
            description =
                "Validate prefixes and origin ASNs using Internet Routing Registry.";
            break;

        default:
            return;
    }

    document.querySelector("main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card">
                <h1>${currPage}</h1>
                <p class="tool-description">
                    ${description}
                </p>
                <div class="tool-input">
                    <input
                        id="${paramId}"
                        class="ip-input"
                        type="text"
                        placeholder="Enter IP Address / Prefix">
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
            location.reload();
        });

    document
        .getElementById("clear-btn")
        .addEventListener("click", () => {

            document.getElementById(paramId).value = "";

            document.getElementById("result-section").innerHTML = "";

        });

}