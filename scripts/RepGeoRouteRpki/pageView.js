//insert a page function
    function pageView(paramId){
    
    document.querySelector("header").style.display="none";
    document.querySelector("footer").style.display="none";
    
    let currPage;
    let btName;
        paramId === 'rep' ? currPage = "Reputation Checker" : 
        paramId === 'geo' ? currPage = "Geo Locator" :
        paramId === 'route' ? currPage = "Route Validator": 

        document.querySelector("footer").style.marginTop="100px";
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
                    <h1>${currPage}</h1>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input class="ip-input" id="${paramId}" type="text" placeholder="Enter IP address/Subnet" style="padding:8px; width:250px; border:1px solid white;">
                        <button id="query-btn" style="padding:8px 16px;cursor:pointer; border:1px solid white" onclick="getResult('${paramId}')">Query</button>
                    </div>
                    <div>
                        <button id="back-btn"style="padding:8px 16px; cursor:pointer; border:1px solid white">Back</button>
                        <button id="clear-btn"style="padding:8px 16px; cursor:pointer; border:1px solid white">Clear</button>
                    </div>
                </div>
            `;

        document.querySelector("#back-btn").addEventListener("click", () => {
            location.reload();
        });
        document.querySelector("#clear-btn").addEventListener("click",()=>{
            document.getElementById(paramId).value = "";
        });
}