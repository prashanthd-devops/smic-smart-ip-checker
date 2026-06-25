function ipPageView() {

    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";

    document.querySelector("main").innerHTML = `
    <section class="report-page">
        <div class="report-card">
            <h1>IP Report</h1>
            <p class="report-description">
                Upload an IP inventory spreadsheet to generate a summarized report.
            </p>
            <div class="report-upload">
                <input
                    id="fileInput"
                    type="file"
                    accept=".xlsx,.xls">
            </div>
            <div class="report-buttons">
                <button id="back-btn" class="secondary-btn">
                    ← Dashboard
                </button>
                <button id="submit-btn" class="primary-btn">
                    Generate Report
                </button>
                <button id="clear-btn" class="secondary-btn">
                    Clear
                </button>
            </div>
            <div id="loadingMsg" style="display:none">
                Processing file...
            </div>
            <div id="emptyMsg" style="display:none">
                No matching records found.
            </div>
            <div id="resultsSection" style="display:none">
                <div id="statusMessage"></div>
                <button
                    id="download-btn"
                    onclick="downloadReport()">
                    Download Report
                </button>
            </div>
        </div>
    </section>
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

    document.getElementById("submit-btn").onclick = () => {
        const file =
            document.getElementById("fileInput").files[0];
        if (!file) {
            alert("Please choose an Excel file.");
            return;
        }
        processFile(file);

    };
}