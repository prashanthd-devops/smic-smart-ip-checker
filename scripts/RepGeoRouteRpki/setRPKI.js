//RPKI Card
function opsRpki(){
    document.querySelector("header").style.display="none";
            document.querySelector("footer").style.display="none";
            document.querySelector("main").innerHTML = `
                <div
                    style="
                            display:flex;
                            flex-direction:column;
                            justify-content:center;
                            align-items:center;
                            gap:10px;
                            width:400px;
                            margin:auto;
                            padding:20px;
                            border:1px solid white;
                            border-radius:8px;
                            box-shadow:2px 2px 2px rgb(22,22,22);
                        "
                    >
                        <h1>RPKI Operations</h1>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button style="padding:8px 16px;cursor:pointer; border:1px solid white" onclick="togRpki('RPKICreate')">RPKI Creation</button>
                            <button style="padding:8px 16px;cursor:pointer; border:1px solid white" onclick="togRpki('RPKIDelete')">RPKI Deletion</button>
                        </div>
                        <div>
                        <button id="back-btn"style="padding:8px 16px; cursor:pointer; border:1px solid white">Back</button>
                        </div>
                </div>
            `;
                document.querySelector("#back-btn").addEventListener("click", () => {
                location.reload();
                });
}

//toggling View for creation and deletion
function togRpki(RPKI) {
    let rpkiName = '';

    RPKI === 'RPKICreate' ? (rpkiName = 'setRpki', createViewRpki()) :
    RPKI === 'RPKIDelete' ? (rpkiName = 'remRpki', deleteViewRpki()) : 
    null;

     function createViewRpki(){
        document.querySelector("main").innerHTML = `
                    <div
                        style="
                                display:flex;
                                flex-direction:column;
                                justify-content:center;
                                align-items:center;
                                gap:10px;
                                width:400px;
                                margin:auto;
                                padding:20px;
                                border:1px solid white;
                                border-radius:8px;
                                box-shadow:2px 2px 2px rgb(22,22,22);
                            "
                        >
                            <h1>RPKI Creation</h1>
                            <textarea 
                                class="rpkiCreate-input" 
                                placeholder="Enter Subnets&#10;(Paste bulk subnets here, one per line)" 
                                style="padding:8px; 
                                       width:250px; 
                                       height:100px; 
                                       border:1px solid white; 
                                       resize:vertical; 
                                       font-family:inherit;"
                            ></textarea>
                            <input class="rpkiCreate-asn" type="text" placeholder="Enter ASN" style="padding:8px; width:250px; border:1px solid white;">
                            <select class="rpkiCreate-org" style="padding:8px; width:268px; border:1px solid white; background:transparent; color:white; cursor:pointer;">
                                <option value="">Select Org</option>
                                <option value="EGNL-1">EGNL-1</option>
                                <option value="SDL-166">SDL-166</option>
                            </select>
                            <input class="rpkiCreate-roa" type="text" placeholder="ROA Name" style="padding:8px; width:250px; border:1px solid white;">
                            <div>
                            <button id="back-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Back</button>
                            <button id="create-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Create</button>
                            </div>
                            <div id="rpki-results" style="width:250px; margin-top:10px;"></div>
                    </div>
        `;
        document.querySelector("#back-btn").addEventListener("click", () => {
            location.reload();
        });
        document.querySelector('#create-btn').addEventListener("click", async ()=>{
           const values = {
                input: document.querySelector('.rpkiCreate-input').value,
                asn: document.querySelector('.rpkiCreate-asn').value,
                roa: document.querySelector('.rpkiCreate-roa').value,
                org: document.querySelector('.rpkiCreate-org').value 
            }
            setRPKI(values);
        })
    }
    function deleteViewRpki(){
        document.querySelector("main").innerHTML = `
            <div style="
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                gap:10px;
                width:400px;
                margin:auto;
                padding:20px;
                border:1px solid white;
                border-radius:8px;
                box-shadow:2px 2px 2px rgb(22,22,22);
            ">
                <h1>RPKI Deletion</h1>
                <textarea 
                    class="rpkiDelete-input" 
                    placeholder="Enter Subnets&#10;(Paste bulk subnets here, one per line)" 
                    style="padding:8px; width:250px; height:100px; border:1px solid white; resize:vertical; font-family:inherit;"
                ></textarea>
                <input class="rpkiDelete-asn" type="text" placeholder="Enter ASN" style="padding:8px; width:250px; border:1px solid white;">
                <select class="rpkiDelete-org" style="padding:8px; width:268px; border:1px solid white; background:transparent; color:white; cursor:pointer; color: #bdcab9; opacity: 1">
                    <option value="">Select Org</option>
                    <option value="EGNL-1">EGNL-1</option>
                    <option value="SDL-166">SDL-166</option>
                </select>
                <div>
                    <button id="back-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Back</button>
                    <button id="delete-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Delete</button>
                </div>
                <div id="rpki-results" style="width:250px; margin-top:10px;"></div>
            </div>
        `;

        document.querySelector("#back-btn").addEventListener("click", () => location.reload());
        document.querySelector('#delete-btn').addEventListener("click", () => {
            const values = {
                input: document.querySelector('.rpkiDelete-input').value,
                asn: document.querySelector('.rpkiDelete-asn').value,
                org: document.querySelector('.rpkiDelete-org').value  // pass org
            }
            remRPKI(values);
        });
    }
}

function validateInput(ipArr) {
        ipArr.map((item) => {

            // 1. Split into IP and CIDR (e.g., "1.1.1.1" and "24")
            const parts = item.split('/');
            if (parts.length !== 2) {
                return alert(`${item} is missing a CIDR slash (/)`);
            }

            const currIp = parts[0];
            const cidr = parts[1];

            // 2. Validate CIDR number (between 0 and 32)
            const cidrNum = Number(cidr);
            if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
                return alert(`Invalid CIDR number: ${cidr}`);
            }

            // 3. Split IP into 4 numbers (e.g., ["1", "1", "1", "1"])
            const ipNumbers = currIp.split('.');
            if (ipNumbers.length !== 4) {
                return alert(`${currIp} must have exactly 4 segments`);
            }

            // 4. Validate each number is between 0 and 255
            for (let i = 0; i < 4; i++) {
                const num = Number(ipNumbers[i]);
                // Check if it is a blank string, not a number, or out of range
                if (ipNumbers[i] === "" || isNaN(num) || num < 0 || num > 255) {
                    return alert(`Invalid IP block "${ipNumbers[i]}" in ${currIp}`);
                }
            }
        });
}

async function setRPKI(values) {
    if (!values.input || !values.asn || !values.roa || !values.org) {
        return alert('Please fill all fields and select an org');
    }

    const asn = values.asn;
    const roa = values.roa;
    const org = values.org;
    const ipArr = values.input.split('\n');

    validateInput(ipArr);

    const resultsDiv = document.querySelector('#rpki-results');
    resultsDiv.innerHTML = `<p style="color:gray;">Processing...</p>`;

    try {
        const response = await fetch(`http://localhost:5000/rpkicreate?ips=${ipArr}&asn=${asn}&roa=${roa}&org=${org}`);
        const data = await response.json();

        resultsDiv.innerHTML = data.result.map(item => `
            <div style="border:1px solid white; padding:8px; margin-bottom:6px; border-radius:4px;">
                <strong>${item.subnet}</strong>
                <span style="color:${item.message?.error ? 'tomato' : 'lightgreen'}; margin-left:8px;">
                    ${item.message?.error ? '✗ ' + item.message.error : '✓ Created'}
                </span>
            </div>
        `).join('');

    } catch {
        resultsDiv.innerHTML = `<p style="color:tomato;">Backend Error!</p>`;
    }
}
    
async function remRPKI(values) {
    if (!values.input || !values.asn || !values.org) {
        return alert('Please fill all fields and select an org');
    }

    const asn = values.asn;
    const org = values.org;
    const ipArr = values.input.split('\n');

    validateInput(ipArr);

    const resultsDiv = document.querySelector('#rpki-results');
    resultsDiv.innerHTML = `<p style="color:gray;">Processing...</p>`;

    try {
        const response = await fetch(`http://localhost:5000/rpkidelete?ips=${ipArr}&asn=${asn}&org=${org}`);
        const data = await response.json();

        if (data.error) {
            resultsDiv.innerHTML = `<p style="color:tomato;">✗ ${data.error}</p>`;
            return;
        }

        resultsDiv.innerHTML = data.result.map(item => `
            <div style="border:1px solid white; padding:8px; margin-bottom:6px; border-radius:4px;">
                <strong>${item.subnet}</strong>
                <span style="color:lightgreen; margin-left:8px;">✓ Deleted</span>
            </div>
        `).join('');

    } catch {
        resultsDiv.innerHTML = `<p style="color:tomato;">Backend Error!</p>`;
    }
}
