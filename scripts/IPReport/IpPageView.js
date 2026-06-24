function ipPageView() {

    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";

    document.querySelector("main").innerHTML = `
        <div class="report-page"
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

            <h1>IP Report</h1>

            <div class="report-toolbar" style="border:1px solid white">
                <input
                    id="fileInput"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                >
            </div>
            <div>
                <button id="back-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Back</button>
                <button id="clear-btn" style="padding:8px 16px; cursor:pointer; border:1px solid white">Clear</button>
            </div>

            <div id="loadingMsg" style="display:none;">
                Loading...
            </div>

            <div id="emptyMsg" style="display:none;">
                No matching records found.
            </div>

            <div id="resultsSection" style="display:none;">

                <p id="statusMessage"></p>

                <button id="download-btn" onclick="downloadReport()" style="border:1px solid white">
                    Download Report
                </button>

            </div>

        </div>
    `;

    document.getElementById("back-btn").onclick = () => location.reload();

    document.getElementById("clear-btn").onclick = () => {

        document.getElementById("fileInput").value = "";

        matchedRows = [];
        allHeaders = [];
        currentFilter = "all";

        document.getElementById("loadingMsg").style.display = "none";
        document.getElementById("emptyMsg").style.display = "none";
        document.getElementById("resultsSection").style.display = "none";
    };

    document.getElementById("fileInput").onchange = e => {
        if (e.target.files.length) {
            processFile(e.target.files[0]);
        }
    };
}