// ============================================
// Validate Prefixes
// ============================================

function validatePrefixes(value) {

    if (!value.trim()) {
        alert("Please enter at least one prefix.");
        return null;
    }

    const prefixes = value
        .split("\n")
        .map(p => p.trim())
        .filter(Boolean);

    for (const prefix of prefixes) {

        const slashIndex = prefix.indexOf("/");
        if (slashIndex === -1) {
            alert(`Invalid prefix (missing CIDR): ${prefix}`);
            return null;
        }

        const ip   = prefix.slice(0, slashIndex);
        const cidr = prefix.slice(slashIndex + 1);

        const octets = ip.split(".");
        if (octets.length !== 4) {
            alert(`Invalid IP address: ${ip}`);
            return null;
        }

        for (const octet of octets) {
            const num = Number(octet);
            if (!Number.isInteger(num) || num < 0 || num > 255) {
                alert(`Invalid IP address: ${ip}`);
                return null;
            }
        }

        const cidrNum = Number(cidr);
        if (!Number.isInteger(cidrNum) || cidrNum < 0 || cidrNum > 32) {
            alert(`Invalid CIDR: ${prefix}`);
            return null;
        }
    }

    return prefixes;
}

// ============================================
// Processing State
// ============================================

function showProcessing() {
    document.getElementById("swip-results").innerHTML = `
        <div class="swip-processing">
            <h3>Processing SWIP Request</h3>
            <p>
                Please wait while the requested network(s)
                are being processed.
            </p>
        </div>
    `;
}

function clearSwipResults() {
    document.getElementById("swip-results").innerHTML = "";
}

// ============================================
// Confirmation Card
// ============================================

function showConfirmation(ip, existingBlock) {

    document.getElementById("swip-results").innerHTML = `
        <div class="swip-confirm">
            <h3>Existing Network Found</h3>
            <p>
                <strong>${existingBlock}</strong> already exists.
                <br><br>
                Do you want to overwrite it?
            </p>
            <div class="swip-confirm-buttons">
                <button class="primary-btn"   id="confirm-yes">Yes</button>
                <button class="secondary-btn" id="confirm-no">No</button>
            </div>
        </div>
    `;

    return {
        yes: document.getElementById("confirm-yes"),
        no:  document.getElementById("confirm-no")
    };
}

// ============================================
// Result Cards
// ============================================

function renderSwipResults(response) {

    const results = document.getElementById("swip-results");
    results.innerHTML = "";

    if (!response.responses?.length) {
        results.innerHTML = `<p class="swip-empty">No results returned.</p>`;
        return;
    }

    response.responses.forEach(item => {

        const statusClass = item.cancelled
            ? "swip-status-warning"
            : item.error
            ? "swip-status-error"
            : "swip-status-success";

        const statusLabel = item.cancelled
            ? "SKIPPED"
            : item.error
            ? "FAILED"
            : "SUCCESS";

        const card = document.createElement("div");
        card.className = "swip-result-card";
        card.innerHTML = `
            <div class="swip-prefix">${item.ip ?? "Unknown"}</div>
            <div class="${statusClass}">${statusLabel}</div>
        `;
        results.appendChild(card);
    });
}