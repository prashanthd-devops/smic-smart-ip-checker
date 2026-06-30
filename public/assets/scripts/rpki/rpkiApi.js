// ==========================================
// Helpers
// ==========================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// Create ROAs
// ==========================================

async function setRPKI(values) {
    if (!values.input || !values.asn || !values.roa || !values.org) {
        return alert("Please fill all fields and select an organization.");
    }

    if (!/^[a-zA-Z0-9_\- ]+$/.test(values.roa)) {
        return alert("ROA Name can only contain letters, numbers, spaces, hyphens, and underscores (no slashes or other symbols).");
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
    button.textContent = "Checking...";
    resultsDiv.innerHTML = `
        <div class="rpki-processing">
            Checking for existing ROAs...
        </div>
    `;

    try {
        const checkUrl =
            `/rpkicheck?ips=${encodeURIComponent(ipArr.join(","))}` +
            `&org=${encodeURIComponent(values.org)}`;

        const checkRes = await fetch(checkUrl);
        const checkData = await checkRes.json();

        const conflicts = (checkData.result || []).filter(r => r.conflicts.length > 0);

        if (conflicts.length > 0) {
            showConflictConfirmation(conflicts, values, ipArr);
            button.disabled = false;
            button.textContent = "Create ROAs";
        } else {
            await executeCreate(values, ipArr);
        }
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `
            <div class="error-box">
                Backend Error while checking for existing ROAs.
            </div>
        `;
        button.disabled = false;
        button.textContent = "Create ROAs";
    }
}

// ==========================================
// Conflict Confirmation
// ==========================================

function showConflictConfirmation(conflicts, values, ipArr) {
    const resultsDiv = document.getElementById("rpki-results");

    // Determine if any conflict has the SAME ASN as the requested create.
    // Same-ASN conflicts can only be Delete & Recreate or Skip — ARIN will
    // reject "create new anyway" for these with E_ROA_RESOURCE_OVERLAP.
    const sameAsnConflicts = conflicts.filter(c =>
        c.conflicts.some(m => String(m.asNumber) === String(values.asn))
    );
    const diffAsnConflicts = conflicts.filter(c =>
        c.conflicts.every(m => String(m.asNumber) !== String(values.asn))
    );

    resultsDiv.innerHTML = `
        <div class="conflict-box">
            <h4>Existing ROAs found</h4>

            ${conflicts.map(c => {
                const isSameAsn = c.conflicts.some(m => String(m.asNumber) === String(values.asn));
                return `
                    <div class="conflict-card">
                        <div class="conflict-prefix">${c.prefix}</div>
                        <ul class="conflict-roa-list">
                            ${c.conflicts.map(m => `
                                <li>
                                    ${m.roaHandle}
                                    <span class="conflict-asn ${String(m.asNumber) === String(values.asn) ? "conflict-asn-match" : ""}">
                                        AS${m.asNumber}
                                    </span>
                                </li>
                            `).join("")}
                        </ul>
                        ${isSameAsn
                            ? `<div class="conflict-note">Same origin ASN (AS${values.asn}) — ARIN will reject a new ROA here unless the existing one is deleted first.</div>`
                            : `<div class="conflict-note">Different origin ASN — a new ROA can be created alongside the existing one.</div>`
                        }
                    </div>
                `;
            }).join("")}

            <div class="conflict-actions">
                <button id="conflict-replace-btn" class="primary-btn">
                    Delete &amp; Recreate (${conflicts.length} prefix${conflicts.length > 1 ? "es" : ""})
                </button>
                <button id="conflict-skip-btn" class="secondary-btn">
                    Keep Existing, Create Rest
                </button>
                ${diffAsnConflicts.length > 0
                    ? `<button id="conflict-create-anyway-btn" class="secondary-btn">
                           Keep Existing, Create New Anyway (${diffAsnConflicts.length})
                       </button>`
                    : ""
                }
            </div>
        </div>
    `;

    // ---- Delete & Recreate: applies to ALL conflicting prefixes ----
    document.getElementById("conflict-replace-btn").addEventListener("click", async () => {
        const allHandles = conflicts.flatMap(c => c.conflicts.map(m => m.roaHandle));

        resultsDiv.innerHTML = `<div class="rpki-processing">Deleting existing ROAs...</div>`;

        try {
            await fetch(
                `/rpkideletebyhandle?handles=${encodeURIComponent(allHandles.join(","))}` +
                `&org=${encodeURIComponent(values.org)}`
            );
        } catch (err) {
            console.error(err);
            resultsDiv.innerHTML = `
                <div class="error-box">
                    Backend Error while deleting existing ROAs.
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = `<div class="rpki-processing">Waiting for ARIN to process deletion...</div>`;
        await sleep(3000);

        await executeCreate(values, ipArr);
    });

    // ---- Keep Existing, Create Rest: skip ALL conflicting prefixes ----
    document.getElementById("conflict-skip-btn").addEventListener("click", async () => {
        const conflictPrefixes = new Set(conflicts.map(c => c.prefix));
        const remaining = ipArr.filter(ip => !conflictPrefixes.has(ip));

        if (remaining.length === 0) {
            resultsDiv.innerHTML = `<div class="rpki-processing">No prefixes left to create.</div>`;
            return;
        }

        await executeCreate(values, remaining);
    });

    // ---- Keep Existing, Create New Anyway: only for DIFFERENT-ASN conflicts ----
    const createAnywayBtn = document.getElementById("conflict-create-anyway-btn");
    if (createAnywayBtn) {
        createAnywayBtn.addEventListener("click", async () => {
            // Prefixes with a same-ASN conflict are still skipped (would fail at ARIN).
            // Prefixes with a different-ASN conflict, plus non-conflicting prefixes, proceed.
            const sameAsnPrefixes = new Set(sameAsnConflicts.map(c => c.prefix));
            const proceedable = ipArr.filter(ip => !sameAsnPrefixes.has(ip));

            if (proceedable.length === 0) {
                resultsDiv.innerHTML = `<div class="rpki-processing">No prefixes eligible to create — all conflicts share the same ASN.</div>`;
                return;
            }

            await executeCreate(values, proceedable);
        });
    }
}

// ==========================================
// Execute Create (actual ARIN call)
// ==========================================

async function executeCreate(values, ipArr) {
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
            `/rpkicreate?` +
            `ips=${encodeURIComponent(ipArr.join(","))}` +
            `&asn=${encodeURIComponent(values.asn)}` +
            `&roa=${encodeURIComponent(values.roa)}` +
            `&org=${encodeURIComponent(values.org)}`;

        const response = await fetch(url);
        const data = await response.json();

        renderRpkiResults(data.result, "create");
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `
            <div class="error-box">
                Backend Error while creating ROAs.
            </div>
        `;
    } finally {
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
            `/rpkidelete?` +
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
            ? "✓ Created" : "✓ Deleted")
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