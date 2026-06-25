// ==========================================
// Create ROAs
// ==========================================

async function setRPKI(values) {
    if (!values.input || !values.asn || !values.roa || !values.org) {
        return alert("Please fill all fields and select an organization.");
    }

    const ipArr = values.input
        .split("\n")
        .map(ip => ip.trim())
        .filter(Boolean);

    if (!validateInput(ipArr)) {
        return;
    }

    const resultsDiv = document.getElementById("rpki-results");

    const button = document.getElementById("create-btn");
    button.disabled = true;
    button.textContent = "Creating...";

    resultsDiv.innerHTML = `
        <div class="rpki-processing">
            Processing Route Origin Authorizations...
        </div>
    `;

    try {

        const url =
            `http://localhost:5000/rpkicreate?` +
            `ips=${encodeURIComponent(ipArr.join(","))}` +
            `&asn=${encodeURIComponent(values.asn)}` +
            `&roa=${encodeURIComponent(values.roa)}` +
            `&org=${encodeURIComponent(values.org)}`;

        const response = await fetch(url);
        const data = await response.json();

        renderRpkiResults(data.result, "create");

    }
    catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `
            <div class="error-box">
                Backend Error while creating ROAs.
            </div>
        `;
    }
    finally {
        button.disabled = false;
        button.textContent = "Create ROAs";
    }

}

// ==========================================
// Delete ROAs
// ==========================================

async function remRPKI(values) {

    if (!values.input || !values.asn || !values.org) {
        return alert("Please fill all fields and select an organization.");
    }

    const ipArr = values.input
        .split("\n")
        .map(ip => ip.trim())
        .filter(Boolean);

    if (!validateInput(ipArr)) {
        return;
    }

    const resultsDiv = document.getElementById("rpki-results");

    const button = document.getElementById("delete-btn");
    button.disabled = true;
    button.textContent = "Deleting...";

    resultsDiv.innerHTML = `
        <div class="rpki-processing">
            Processing Route Origin Authorizations...
        </div>
    `;

    try {

        const url =
            `http://localhost:5000/rpkidelete?` +
            `ips=${encodeURIComponent(ipArr.join(","))}` +
            `&asn=${encodeURIComponent(values.asn)}` +
            `&org=${encodeURIComponent(values.org)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            resultsDiv.innerHTML = `
                <div class="error-box">
                    ${data.error}
                </div>
            `;
            return;
        }

        renderRpkiResults(data.result, "delete");

    }
    catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `
            <div class="error-box">
                Backend Error while deleting ROAs.
            </div>
        `;
    }
    finally {
        button.disabled = false;
        button.textContent = "Delete ROAs";
    }

}

// ==========================================
// Render Results
// ==========================================

function renderRpkiResults(results, action) {

    const resultsDiv = document.getElementById("rpki-results");

    resultsDiv.innerHTML = results.map(item => {
        const success =
            action === "delete"
                ? true
                : !item.message?.error;
        const status = success
            ? (action === "create"
                ? "✓ Created"
                : "✓ Deleted")
            : `✗ ${item.message.error}`;
        return `
            <div class="rpki-result-card">
                <div class="rpki-prefix">
                    ${item.subnet}
                </div>
                <div class="${success ? "rpki-success" : "rpki-error"}">
                    ${status}
                </div>
            </div>
        `;
    }).join("");
}