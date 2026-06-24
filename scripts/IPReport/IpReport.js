

// ─── Constants ───────────────────────────────────────────────────────────────
const TARGET_CLIENT_ID = '1458';
const COMPANY_RE = /egn[\s\-]*free[\s\-]*devices/i;
 
const GROUP_4X16_RE  = /SC1\s*-\s*AS18779\s+AVAILABLE\s+4x16/i;
const GROUP_17_RE    = /SC1\s*-\s*AS18779\s*-\s*\/17\s+and\s+Smaller/i;
const GROUP_15_RE    = /SC1\s*-\s*AS18779\s+AVAILABLE\s*\(\/15\s+only\)/i;
 
const GROUP_LABELS = {
  '4x16': 'EGN FREE 4x /16',
  '17':   'EGN FREE /17 and Smaller',
  '15':   'EGN FREE /15 Only'
};
 
// ─── State ───────────────────────────────────────────────────────────────────
let matchedRows = [];
let allHeaders  = [];
let currentFilter = 'all';
 
// ─── Column fuzzy finder ──────────────────────────────────────────────────────
function norm(s){ return String(s).toLowerCase().replace(/[\s_\-]/g,''); }
function findCol(row, names){
  const keys = Object.keys(row);
  for(const n of names){
    const k = keys.find(k => norm(k) === norm(n));
    if(k !== undefined) return k;
  }
  return null;
}
 
// ─── Prefix length parser ─────────────────────────────────────────────────────
function prefixLen(addr){
  const m = String(addr||'').match(/\/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
 
// ─── Group classifier ─────────────────────────────────────────────────────────
function classifyGroup(val){
  const s = String(val||'');
  if(GROUP_4X16_RE.test(s))  return '4x16';
  if(GROUP_17_RE.test(s))    return '17';
  if(GROUP_15_RE.test(s))    return '15';
  return null;
}
 
// ─── File handling ────────────────────────────────────────────────────────────
document.getElementById('fileInput').onchange = e => {
  if(e.target.files[0]) processFile(e.target.files[0]);
};
 
const dz = document.getElementById('dropZone');
dz.ondragover  = e => { e.preventDefault(); dz.classList.add('drag-over'); };
dz.ondragleave = () => dz.classList.remove('drag-over');
dz.ondrop      = e => {
  e.preventDefault(); dz.classList.remove('drag-over');
  if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
};
 
function processFile(file){
  document.getElementById('loadingMsg').style.display = 'block';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('emptyMsg').style.display = 'none';
 
  const reader = new FileReader();
  reader.onload = e => {
    setTimeout(() => {
      try {
        const wb   = XLSX.read(e.target.result, { type:'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval:'' });
        if(!data.length){ showEmpty(); return; }
        allHeaders = Object.keys(data[0]);
        analyzeData(data);
      } catch(err){
        document.getElementById('loadingMsg').style.display = 'none';
        alert('Could not parse file: ' + err.message);
      }
    }, 50);
  };
  reader.readAsArrayBuffer(file);
}
 
// ─── Core filter logic ────────────────────────────────────────────────────────
function analyzeData(data){
  matchedRows = [];
  let totalRows = data.length;
  let passClient = 0, passCompany = 0, passGroup = 0, passPrefix = 0;
 
  data.forEach(row => {
    const ck  = findCol(row, ['client_id','clientid','client']);
    const cpk = findCol(row, ['client_ip','company','company_name','client_company','serviceid']);
    const gk  = findCol(row, ['group_description','groupdescription','grp_desc','service_description','addr_group_description']);
    const ak  = findCol(row, ['addr','address','prefix','ip','network']);
 
    const clientVal  = String(row[ck]||'').trim();
    const compVal    = String(row[cpk]||'');
    const groupVal   = String(row[gk]||'');
    const addrVal    = String(row[ak]||'');
 
    const okClient  = clientVal === TARGET_CLIENT_ID;
    if(okClient) passClient++;
 
    const okCompany = COMPANY_RE.test(compVal);
    if(okClient && okCompany) passCompany++;
 
    const groupKey  = classifyGroup(groupVal);
    const okGroup   = groupKey !== null;
    if(okClient && okCompany && okGroup) passGroup++;
 
    const pl        = prefixLen(addrVal);
    const okPrefix  = pl !== null && pl <= 24;
    if(okClient && okCompany && okGroup && okPrefix) passPrefix++;
 
    if(okClient && okCompany && okGroup && okPrefix){
      matchedRows.push({ ...row, _group: groupKey, _prefixLen: pl });
    }
  });
 
  document.getElementById('loadingMsg').style.display = 'none';
 
  if(!matchedRows.length){ showEmpty(); return; }
 
  document.getElementById("statusMessage").textContent =
    `Report generated successfully. Found ${matchedRows.length} matching records.`;

  document.getElementById("resultsSection").style.display = "block";
}
 
// ─── Stats bar ────────────────────────────────────────────────────────────────
function renderStats(total, c1, c2, c3, c4){
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat"><div class="num">${total.toLocaleString()}</div><div class="lbl">Total rows in file</div></div>
    <div class="stat c-blue"><div class="num">${c1.toLocaleString()}</div><div class="lbl">Client 1458 match</div></div>
    <div class="stat c-yellow"><div class="num">${c3.toLocaleString()}</div><div class="lbl">Group match</div></div>
    <div class="stat c-green"><div class="num">${c4.toLocaleString()}</div><div class="lbl">Final matches (≤ /24)</div></div>
  `;
}
 
// ─── Summary cards ────────────────────────────────────────────────────────────
function buildPrefixCounts(groupKey){
  const counts = {};
  matchedRows.filter(r => r._group === groupKey).forEach(r => {
    const k = '/' + r._prefixLen;
    counts[k] = (counts[k]||0) + 1;
  });
  // Sort by prefix length numerically (smallest prefix = largest block first)
  return Object.entries(counts).sort((a,b) => parseInt(a[0].slice(1)) - parseInt(b[0].slice(1)));
}
 
function renderSummary(){
  const groups = ['4x16','17','15'];
  const colors = { '4x16': 'var(--warning)', '17': '#a78bfa', '15': 'var(--info)' };
 
  let html = '';
  groups.forEach(g => {
    const entries = buildPrefixCounts(g);
    const total   = matchedRows.filter(r => r._group === g).length;
 
    const rows = entries.length
      ? entries.map(([prefix, cnt]) => `
          <div class="summary-row">
            <span class="prefix">${prefix}</span>
            <span class="count">${cnt.toLocaleString()}</span>
          </div>`).join('')
      : '<p style="font-size:12px;color:var(--text3);padding:6px 0">No matches</p>';
 
    html += `
      <div class="summary-card">
        <div class="sc-title" style="color:${colors[g]}">${GROUP_LABELS[g]}</div>
        ${rows}
        ${entries.length ? `
        <div class="summary-total">
          <span>Total IPs</span>
          <span>${total.toLocaleString()}</span>
        </div>` : ''}
      </div>`;
  });
 
  document.getElementById('summaryGrid').innerHTML = html;
}
 
// ─── Table preview ────────────────────────────────────────────────────────────
function renderTable(filter){
  filter = filter || currentFilter;
  const data = filter === 'all'
    ? matchedRows
    : matchedRows.filter(r => r._group === filter);
 
  document.getElementById('matchCount').textContent = `${data.length.toLocaleString()} rows`;
 
  const hiddenCols = ['_group','_prefixLen'];
  const cols = allHeaders.filter(h => !hiddenCols.includes(h));
 
  // Pick meaningful columns to show (limit to 7 for readability)
  const priority = ['addr','group_description','client_id','company','company_name','client_ip','service_id','service_description'];
  let showCols = priority.filter(p => cols.find(c => norm(c) === norm(p))).map(p => cols.find(c => norm(c)===norm(p)));
  if(showCols.length < 4) showCols = cols.slice(0, 8);
  showCols = showCols.slice(0, 7);
 
  const groupColors = { '4x16':'var(--warning)', '17':'#a78bfa', '15':'var(--info)' };
  const groupShort  = { '4x16':'4x16', '17':'/17 Smaller', '15':'/15 Only' };
 
  document.getElementById('thead').innerHTML =
    '<tr>' + showCols.map(h => `<th title="${h}">${h}</th>`).join('') + '<th style="width:90px">group</th></tr>';
 
  document.getElementById('tbody').innerHTML = data.slice(0, 500).map(row => {
    const gc = groupColors[row._group] || 'var(--text3)';
    const gl = groupShort[row._group] || row._group;
    return '<tr>' +
      showCols.map(h => `<td title="${row[h]}">${row[h]}</td>`).join('') +
      `<td><span style="font-size:10px;font-weight:600;color:${gc}">${gl}</span></td>` +
      '</tr>';
  }).join('');
}
 
function filterTable(group, btn){
  currentFilter = group;
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable(group);
}
 
function showEmpty(){
  document.getElementById('loadingMsg').style.display = 'none';
  document.getElementById('emptyMsg').style.display = 'block';
}


 
// // ─── Download ─────────────────────────────────────────────────────────────────
function downloadReport() {
    if (!matchedRows.length) return;

    const wb = XLSX.utils.book_new();

    // -----------------------------
    // Main Report
    // -----------------------------
    const report = [
        ["/24 Available Subnets", "Group Description"]
    ];

    matchedRows.forEach(row => {
        report.push([
            row.addr,
            GROUP_LABELS[row._group]
        ]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(report);

    // -----------------------------
    // Summary Matrix
    // -----------------------------
    const prefixes = [24, 23, 22, 21, 20, 19];
    const groups = ["4x16", "17", "15"];

    const summary = [];

    // Header
    summary.push([
        "Available IP's Short Summary",
        "/24",
        "/23",
        "/22",
        "/21",
        "/20",
        "/19"
    ]);

    // Group rows
    groups.forEach(group => {

        const row = [GROUP_LABELS[group]];

        prefixes.forEach(prefix => {

            const count = matchedRows.filter(r =>
                r._group === group &&
                r._prefixLen === prefix
            ).length;

            row.push(count ? count : "");
        });

        summary.push(row);
    });

    // Total row
    const totalRow = ["TOTAL"];

    prefixes.forEach(prefix => {

        const total = matchedRows.filter(r =>
            r._prefixLen === prefix
        ).length;

        totalRow.push(total ? total : "");
    });

    summary.push(totalRow);

    // Add summary starting at Column E
    XLSX.utils.sheet_add_aoa(ws, summary, {
        origin: "E1"
    });

    // -----------------------------
    // Column Widths
    // -----------------------------
    ws["!cols"] = [
        { wch: 28 }, // A
        { wch: 30 }, // B
        { wch: 3 },  // C
        { wch: 3 },  // D
        { wch: 34 }, // E
        { wch: 8 },  // F
        { wch: 8 },  // G
        { wch: 8 },  // H
        { wch: 8 },  // I
        { wch: 8 },  // J
        { wch: 8 }   // K
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Available Subnets");

    XLSX.writeFile(wb, "EGN_FREE_DEVICES_IP_Report.xlsx");
}


// function downloadReport(){
//   if(!matchedRows.length) return;
 
//   const wb = XLSX.utils.book_new();
 
//   // Sheet 1 — All matched rows
//   const clean = matchedRows.map(r => {
//     const o = {...r}; delete o._group; delete o._prefixLen; return o;
//   });
//   const ws1 = XLSX.utils.json_to_sheet(clean);
//   XLSX.utils.book_append_sheet(wb, ws1, 'Matched IPs');
 
//   // Sheet 2 — Per group sheets
//   ['4x16','17','15'].forEach(g => {
//     const rows = matchedRows.filter(r => r._group === g).map(r => {
//       const o = {...r}; delete o._group; delete o._prefixLen; return o;
//     });
//     const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
//     XLSX.utils.book_append_sheet(wb, ws, GROUP_LABELS[g].replace(/\//g,'').slice(0,31));
//   });
 
//   // Sheet 3 — Summary
//   const now = new Date().toLocaleString();
//   const summaryAoa = [
//     ['EGN FREE DEVICES — /24 Available IPs Short Summary'],
//     ['Generated:', now],
//     [''],
//     ['Filter Criteria', 'Value'],
//     ['client_id', '1458'],
//     ['company (contains)', 'EGN-FREE DEVICES'],
//     ['Group 1', 'SC1 - AS18779 AVAILABLE 4x16 (23.230, 192.177, 142.252, 172.252)'],
//     ['Group 2', 'SC1 - AS18779 AVAILABLE (/15 only)'],
//     ['Group 3', 'SC1 - AS18779 - /17 and Smaller Allocations (EGN - FREE DEVICES)'],
//     ['addr prefix', '/24 or larger only (prefix length ≤ 24)'],
//     [''],
//     ['── EGN FREE 4x /16 ──', ''],
//     ['Prefix', 'Count'],
//   ];
 
//   ['4x16','17','15'].forEach((g, i) => {
//     if(i > 0) summaryAoa.push(['']);
//     summaryAoa.push([`── ${GROUP_LABELS[g]} ──`, '']);
//     summaryAoa.push(['Prefix', 'Count']);
//     const entries = buildPrefixCounts(g);
//     if(entries.length){
//       entries.forEach(([prefix, cnt]) => summaryAoa.push([prefix, cnt]));
//       summaryAoa.push(['Total', matchedRows.filter(r => r._group === g).length]);
//     } else {
//       summaryAoa.push(['(no matches)', '']);
//     }
//   });
 
//   summaryAoa.push(['']);
//   summaryAoa.push(['Grand Total (all groups)', matchedRows.length]);
 
//   // remove the duplicate first entry we pushed above
//   const finalSummary = summaryAoa.filter((_, idx) => {
//     // remove the erroneous lines pushed before the forEach (lines 12-13 in original)
//     return true;
//   });
 
//   // Rebuild clean summary
//   const cleanSummary = [
//     ['EGN FREE DEVICES — /24 Available IPs Short Summary'],
//     ['Generated:', now],
//     [''],
//     ['Filter Criteria', 'Value'],
//     ['client_id', '1458'],
//     ['company (contains)', 'EGN-FREE DEVICES'],
//     ['Group 1', 'SC1 - AS18779 AVAILABLE 4x16 (23.230, 192.177, 142.252, 172.252)'],
//     ['Group 2', 'SC1 - AS18779 AVAILABLE (/15 only)'],
//     ['Group 3', 'SC1 - AS18779 - /17 and Smaller Allocations (EGN - FREE DEVICES) (portalxd:index, noc:allocate)'],
//     ['addr prefix', '/24 or larger only (prefix length ≤ 24)'],
//     [''],
//   ];
 
//   ['4x16','17','15'].forEach(g => {
//     cleanSummary.push([`── ${GROUP_LABELS[g]} ──`, '']);
//     cleanSummary.push(['Prefix', 'Count']);
//     const entries = buildPrefixCounts(g);
//     if(entries.length){
//       entries.forEach(([prefix, cnt]) => cleanSummary.push([prefix, cnt]));
//       cleanSummary.push(['TOTAL', matchedRows.filter(r => r._group === g).length]);
//     } else {
//       cleanSummary.push(['(no matches)', '']);
//     }
//     cleanSummary.push(['']);
//   });
 
//   cleanSummary.push(['GRAND TOTAL (all groups)', matchedRows.length]);
 
//   const ws3 = XLSX.utils.aoa_to_sheet(cleanSummary);
 
//   // Column widths for summary sheet
//   ws3['!cols'] = [{ wch: 52 }, { wch: 14 }];
 
//   XLSX.utils.book_append_sheet(wb, ws3, 'Summary');
 
//   XLSX.writeFile(wb, 'EGN_FREE_DEVICES_IP_Report.xlsx');
// }
