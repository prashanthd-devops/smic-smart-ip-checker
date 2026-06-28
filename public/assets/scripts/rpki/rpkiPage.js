// ==========================================
// RPKI Dashboard
// ==========================================

function opsRpki() {

    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";

    renderRpkiHome();

}

// ==========================================
// Home
// ==========================================

function renderRpkiHome() {

    document.querySelector(".main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card">
                <h1>RPKI Operations</h1>
                <p class="tool-description">
                    Manage Route Origin Authorizations through the ARIN REST API.
                </p>
                <div class="operation-grid">
                    <div
                        class="operation-card"
                        onclick="renderRpkiCreate()">
                        <div class="operation-icon">
                            🔐
                        </div>
                        <h3>Create ROA</h3>
                        <p>
                            Create Route Origin Authorizations for one or more IPv4 prefixes.
                        </p>
                        <span>Open →</span>
                    </div>
                    <div
                        class="operation-card"
                        onclick="renderRpkiDelete()">
                        <div class="operation-icon">
                            🗑️
                        </div>
                        <h3>Delete ROA</h3>
                        <p>
                            Remove Route Origin Authorizations from ARIN.
                        </p>
                        <span>Open →</span>
                    </div>
                </div>
                <div class="tool-buttons">
                    <button
                        class="secondary-btn"
                        onclick="location.reload()">
                        ← Dashboard
                    </button>
                </div>
            </div>
        </section>
    `;
}

// ==========================================
// Create ROA Page
// ==========================================

function renderRpkiCreate() {

    document.querySelector("main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card large">
                <h1>Create ROA</h1>
                <p class="tool-description">
                    Enter one IPv4 prefix per line.
                </p>
                <div class="form-group">
                    <label for="rpkiCreate-input">
                        Prefixes
                    </label>
                    <textarea
                        id="rpkiCreate-input"
                        rows="8"
                        spellcheck="false"
                        placeholder="203.0.113.0/24&#10;198.51.100.0/24"></textarea>
                </div>
                <div class="form-group">
                    <label for="rpkiCreate-asn">
                        ASN
                    </label>
                    <input
                        id="rpkiCreate-asn"
                        autocomplete="off"
                        placeholder="AS399077">
                </div>
                <div class="form-group">
                    <label for="rpkiCreate-org">
                        Organization
                    </label>
                    <select id="rpkiCreate-org">
                        <option value="">
                            Select Organization
                        </option>
                        <option value="EGNL-1">
                            EGNL-1
                        </option>
                        <option value="SDL-166">
                            SDL-166
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="rpkiCreate-roa">
                        ROA Name
                    </label>
                    <input
                        id="rpkiCreate-roa"
                        autocomplete="off"
                        placeholder="Production ROA">
                </div>

                <div class="tool-buttons">
                    <button
                        class="secondary-btn"
                        onclick="opsRpki()">
                        ← Back
                    </button>
                    <button
                        class="primary-btn"
                        id="create-btn">
                        Create ROAs
                    </button>
                </div>
                <div class="help-section">
                    <h4>How to use</h4>
                    <ul>
                        <li>Enter one IPv4 prefix per line e.g. <code>203.0.113.0/24</code></li>
                        <li>Enter the origin ASN e.g. <code>AS399077</code></li>
                        <li>Select the Organization that owns the prefixes</li>
                        <li>Give the ROA a name e.g. <code>Production ROA</code></li>
                        <li>Click <strong>Create ROAs</strong> — one ROA will be created per prefix</li>
                    </ul>
                </div>
                <div id="rpki-results"></div>
            </div>
        </section>
    `;

    document
        .getElementById("create-btn")
        .addEventListener("click", () => {

            const formData = {
                input: document.getElementById("rpkiCreate-input").value,
                asn: document.getElementById("rpkiCreate-asn").value,
                roa: document.getElementById("rpkiCreate-roa").value,
                org: document.getElementById("rpkiCreate-org").value
            };

            setRPKI(formData);
        });
}

// ==========================================
// Delete ROA Page
// ==========================================

function renderRpkiDelete() {

    document.querySelector("main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card large">
                <h1>Delete ROA</h1>
                <p class="tool-description">
                    Enter one IPv4 prefix per line.
                </p>
                <div class="form-group">
                    <label for="rpkiDelete-input">
                        Prefixes
                    </label>
                    <textarea
                        id="rpkiDelete-input"
                        rows="8"
                        spellcheck="false"
                        placeholder="203.0.113.0/24&#10;198.51.100.0/24"></textarea>
                </div>
                <div class="form-group">
                    <label for="rpkiDelete-asn">
                        ASN
                    </label>
                    <input
                        id="rpkiDelete-asn"
                        autocomplete="off"
                        placeholder="AS399077">
                </div>
                <div class="form-group">
                    <label for="rpkiDelete-org">
                        Organization
                    </label>
                    <select id="rpkiDelete-org">
                        <option value="">
                            Select Organization
                        </option>
                        <option value="EGNL-1">
                            EGNL-1
                        </option>
                        <option value="SDL-166">
                            SDL-166
                        </option>
                    </select>
                </div>

                <div class="tool-buttons">
                    <button
                        class="secondary-btn"
                        onclick="opsRpki()">
                        ← Back
                    </button>
                    <button
                        class="primary-btn"
                        id="delete-btn">
                        Delete ROAs
                    </button>
                </div>
                <div class="help-section">
                    <h4>How to use</h4>
                    <ul>
                        <li>Enter one IPv4 prefix per line e.g. <code>203.0.113.0/24</code></li>
                        <li>Enter the ASN associated with the ROA e.g. <code>AS399077</code></li>
                        <li>Select the Organization that owns the prefixes</li>
                        <li>Click <strong>Delete ROAs</strong> — matching ROAs will be removed from ARIN</li>
                        <li>Only ROAs that exactly match the prefix + ASN + Org combination will be deleted</li>
                    </ul>
                </div>
                <div id="rpki-results"></div>
            </div>
        </section>
    `;

    document
        .getElementById("delete-btn")
        .addEventListener("click", () => {

            const formData = {
                input: document.getElementById("rpkiDelete-input").value,
                asn: document.getElementById("rpkiDelete-asn").value,
                org: document.getElementById("rpkiDelete-org").value
            };
            remRPKI(formData);
        });
}