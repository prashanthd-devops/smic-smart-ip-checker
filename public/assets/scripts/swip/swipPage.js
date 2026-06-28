// ============================================
// SWIP Dashboard Entry
// ============================================

function opsSwip() {
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
    renderSwipHome();
}

// ============================================
// Home
// ============================================

function renderSwipHome() {
    document.querySelector(".main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card">
                <h1>SWIP Operations</h1>
                <p class="tool-description">
                    Create and manage ARIN customer reassignments using
                    Simple or Detailed SWIP operations.
                </p>
                <div class="operation-grid">
                    <div class="operation-card" onclick="renderSimpleSwip()">
                        <div class="operation-icon">📄</div>
                        <h3>Simple SWIP</h3>
                        <p>
                            Create or update customer reassignments
                            using the minimum required information.
                        </p>
                        <span>Open →</span>
                    </div>
                    <div class="operation-card" onclick="renderDetailedSwip()">
                        <div class="operation-icon">🏢</div>
                        <h3>Detailed SWIP</h3>
                        <p>
                            Create detailed customer reassignments
                            with organization validation.
                        </p>
                        <span>Open →</span>
                    </div>
                </div>
                <div class="tool-buttons">
                    <button class="secondary-btn" onclick="location.reload()">
                        ← Dashboard
                    </button>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// Simple SWIP
// ============================================

function renderSimpleSwip() {

    document.querySelector("main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card tool-card-large">
                <h1>Simple SWIP</h1>
                <p class="tool-description">
                    Create customer reassignments using basic information.
                </p>
                <div class="form-group">
                    <label>Prefixes</label>
                    <textarea
                        id="simple-prefixes"
                        rows="8"
                        placeholder="192.168.0.0/24&#10;192.168.1.0/24"></textarea>
                </div>
                <div class="form-group">
                    <label>Organization</label>
                    <select id="simple-org">
                        <option value="">Select Organization</option>
                        <option value="EGNL-1">EGNL-1</option>
                        <option value="SDL-166">SDL-166</option>
                    </select>
                </div>
                <div class="tool-buttons">
                    <button class="secondary-btn" onclick="opsSwip()">
                        ← Back
                    </button>
                    <button class="primary-btn" id="simple-submit">
                        Submit
                    </button>
                </div>
                <div class="help-section">
                    <h4>How to use</h4>
                    <ul>
                        <li>Enter one IPv4 prefix per line e.g. <code>192.168.0.0/24</code></li>
                        <li>Select the parent Organization (EGNL-1 or SDL-166)</li>
                        <li>Click <strong>Submit</strong> — if a network already exists you will be asked to confirm overwrite</li>
                        <li>Use Simple SWIP when you only need to register the subnet without full org details</li>
                    </ul>
                </div>
                <div id="swip-results"></div>
            </div>
        </section>
    `;

    document.getElementById("simple-submit").onclick = () => {

        const prefixes = validatePrefixes(
            document.getElementById("simple-prefixes").value
        );
        if (!prefixes) return;

        const orgID = document.getElementById("simple-org").value;
        if (!orgID) return alert("Please select an Organization.");

        submitSimpleSwip(prefixes, orgID);
    };
}

// ============================================
// Detailed SWIP
// ============================================

function renderDetailedSwip() {

    document.querySelector("main").innerHTML = `
        <section class="tool-page">
            <div class="tool-card tool-card-large">
                <h1>Detailed SWIP</h1>
                <p class="tool-description">
                    Create customer reassignments with
                    detailed organization validation.
                </p>
                <div class="form-group">
                    <label>Prefixes</label>
                    <textarea
                        id="detailed-prefixes"
                        rows="8"
                        placeholder="192.168.0.0/24&#10;192.168.1.0/24">
                    </textarea>
                </div>
                <div class="form-group">
                    <label>Customer Organization Handle</label>
                    <input
                        id="detailed-org"
                        type="text"
                        placeholder="Example: EGNL-1">
                </div>
                <div class="tool-buttons">
                    <button class="secondary-btn" onclick="opsSwip()">
                        ← Back
                    </button>
                    <button class="primary-btn" id="detailed-submit">
                        Submit
                    </button>
                </div>
                <div class="help-section">
                    <h4>How to use</h4>
                    <ul>
                        <li>Enter one IPv4 prefix per line e.g. <code>192.168.0.0/24</code></li>
                        <li>Enter the customer Organization Handle e.g. <code>EGNL-1</code></li>
                        <li>The handle will be validated against ARIN before submission</li>
                        <li>Use Detailed SWIP when the customer already has an ARIN Org handle</li>
                    </ul>
                </div>
                <div id="swip-results"></div>
            </div>
        </section>
    `;

    document.getElementById("detailed-submit").onclick = () => {

        const prefixes = validatePrefixes(
            document.getElementById("detailed-prefixes").value
        );
        if (!prefixes) return;

        const orgID = document.getElementById("detailed-org").value.trim();
        if (!orgID) return alert("Please enter an Organization Handle.");

        submitDetailedSwip(prefixes, orgID);
    };
}