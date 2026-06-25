// ============================================
// Fetch Helper
// ============================================

async function swipFetch(endpoint, body) {

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
    }

    return response.json();
}

// ============================================
// Confirmation Handler
// ============================================

function handlePendingConfirmation(pending, onConfirm) {

    const buttons = showConfirmation(
        pending.ip,
        pending.existingBlock
    );

    buttons.yes.onclick = () => onConfirm({ [pending.ip]: "yes" });
    buttons.no.onclick  = () => onConfirm({ [pending.ip]: "no"  });
}

// ============================================
// Simple SWIP
// ============================================

async function submitSimpleSwip(prefixes, orgID, confirmations = {}) {

    showProcessing();

    try {
        const url = "http://localhost:5000";
        const data = await swipFetch(`${url}/swip/simple`, {
            ipArray: prefixes,
            orgID,
            confirmations
        });

        if (data.status === "pending") {
            handlePendingConfirmation(
                data.responses[0],
                (updated) => submitSimpleSwip(prefixes, orgID, updated)
            );
            return;
        }

        renderSwipResults(data);

    } catch (err) {
        console.error("[Simple SWIP]", err);
        alert(`Unable to communicate with backend.\n${err.message}`);
    }
}

// ============================================
// Detailed SWIP
// ============================================

async function submitDetailedSwip(prefixes, orgID, confirmations = {}) {

    showProcessing();

    try {
        const url = "http://localhost:5000"
        const data = await swipFetch(`${url}/swip/detailed`, {
            ipArray: prefixes,
            orgID,
            confirmations
        });

        if (data.status === "pending") {
            handlePendingConfirmation(
                data.responses[0],
                (updated) => submitDetailedSwip(prefixes, orgID, updated)
            );
            return;
        }

        renderSwipResults(data);

    } catch (err) {
        console.error("[Detailed SWIP]", err);
        alert(`Unable to communicate with backend.\n${err.message}`);
    }
}