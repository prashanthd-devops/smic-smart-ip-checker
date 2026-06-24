// // ----------------------
// // DNSBLs
// // ----------------------
// const dnsblLists = [
// //  {
//   //  removal: (ip) => `https://check.spamhaus.org/results/?query=${ip}`,
//    // domains: ["zen.spamhaus.org"],
//  // },
//   {
//     removal: () => "https://www.spamcop.net/bl.shtml",
//     domains: ["bl.spamcop.net"],
//   },
//   {
//     removal: () => "https://www.barracudacentral.org/rbl/removal-request/",
//     domains: ["b.barracudacentral.org"],
//   },
//  // {
//    // removal: (ip) => `https://check.spamhaus.org/results/?query=${ip}`,
//    // domains: ["cbl.abuseat.org"],
// //  },
//   {
//     removal: (ip) => `https://spameatingmonkey.com/lookup/${ip}`,
//     domains: ["backscatter.spameatingmonkey.net", "bl.spameatingmonkey.net"],
//   },
//   {
//     removal: () => "https://www.uceprotect.net/en/rblcheck.php",
//     domains: [
//       "dnsbl-0.uceprotect.net",
//       "dnsbl-1.uceprotect.net",
//       "dnsbl-2.uceprotect.net",
//       "dnsbl-3.uceprotect.net",
//     ],
//   },
//   {
//     removal: () => "https://www.usenix.org.uk/content/rblremovehelp",
//     domains: ["all.s5h.net"],
//   },
//   {
//     removal: (ip) => `https://psbl.org/remove?ip=${ip}&action=Remove+IP`,
//     domains: ["psbl.surriel.com"],
//   },
//   {
//     removal: () => "https://www.blocklist.de/en/delist.html",
//     domains: ["bl.blocklist.de"],
//   },
//   {
//     removal: (ip) => `https://www.spamrats.com/rats-auth.php?ip=${ip}#removal`,
//     domains: ["auth.spamrats.com"],
//   },
//   {
//     removal: (ip) => `https://www.spamrats.com/rats-dyna.php?ip=${ip}#removal`,
//     domains: ["dyna.spamrats.com"],
//   },
//   {
//     removal: (ip) => `https://www.spamrats.com/rats-noptr.php?ip=${ip}#removal`,
//     domains: ["noptr.spamrats.com"],
//   },
//   {
//     removal: (ip) => `https://www.spamrats.com/rats-spam.php?ip=${ip}#removal`,
//     domains: ["spam.spamrats.com"],
//   },
//   {
//     removal: () => "http://www.gbudb.com/truncate/how-ips-are-removed.jsp",
//     domains: ["truncate.gbudb.net"],
//   },
//   {
//     removal: () => "https://servicecentral.trendmicro.com/en-us/ers/ip-lookup/",
//     domains: ["r.mail-abuse.com", "q.mail-abuse.com"],
//   },
//   {
//     removal: () => "https://www.redhawk.org/delisting/",
//     domains: ["access.redhawk.org"],
//   },
//   {
//     removal: () => "https://www.scientificspam.net/delisting/",
//     domains: ["bl.scientificspam.net"],
//   },
//   {
//     removal: () => "https://www.nordspam.com/delisting/",
//     domains: ["bl.nordspam.com"],
//   },
//   {
//     removal: () => "https://www.surbl.org/lookup",
//     domains: ["multi.surbl.org"],
//   },
//   { removal: () => "https://www.uribl.com/reports/", domains: ["uribl.com"] },
//   {
//     removal: () => "https://www.invaluement.com/delisting/",
//     domains: [
//       "ivmSIP.invaluement.com",
//       "ivmSIP24.invaluement.com",
//       "ivmURI.invaluement.com",
//     ],
//   },
//   {
//     removal: () => "https://www.dnsbl.info/delisting/",
//     domains: ["dnsbl.info"],
//   },
//   { removal: () => "https://www.0spam.org/request", domains: ["bl.0spam.org"] },
//   {
//     removal: () => "https://www.mxtoolbox.com/problem/blacklist/spfbl-dnsbl",
//     domains: ["spfbl-dnsbl.mxtoolbox.com"],
//   },
//   {
//     removal: () => "https://multirbl.valli.org/",
//     domains: ["multirbl.valli.org"],
//   },
//   {
//     removal: () => "https://www.dnsbl.info/dnsbl-list.php",
//     domains: ["dnsbl.s5h.net", "dnsbl-uceprotect.net", "dnsbl.spamcop.net"],
//   },
//   {
//     removal: () => "https://www.woody.ch/delisting/",
//     domains: ["blacklist.woody.ch"],
//   },
//   {
//     removal: () => "https://www.cymru.com/blacklists/",
//     domains: ["bogons.cymru.com"],
//   },
//   {
//     removal: () => "https://www.abuse.ch/blacklist/",
//     domains: ["combined.abuse.ch"],
//   },
//   {
//     removal: () => "https://www.wpbl.info/delisting/",
//     domains: ["db.wpbl.info"],
//   },
//   {
//     removal: () => "https://www.dronebl.org/delisting/",
//     domains: ["dronebl.org"],
//   },
//   {
//     removal: () => "https://www.duinv.aupads.org/delisting/",
//     domains: ["duinv.aupads.org"],
//   },
//   {
//     removal: () => "https://www.ips.backscatterer.org/delisting/",
//     domains: ["ips.backscatterer.org"],
//   },
//   {
//     removal: () => "https://www.korea.services.net/delisting/",
//     domains: ["korea.services.net"],
//   },
//   {
//     removal: () => "https://www.orvedb.aupads.org/delisting/",
//     domains: ["orvedb.aupads.org"],
//   },

//   {
//     removal: () => "https://www.capsbl.surriel.com/delisting/",
//     domains: ["capsbl.surriel.com"],
//   },
//   {
//     removal: () => "https://www.surriel.com/delisting/",
//     domains: ["surriel.com"],
//   },
// ];

// export default dnsblLists;

const PRIORITY_DNSBLS = [
    {
        name:    "Spamhaus SBL",
        domain:  "sbl.spamhaus.org",
        removal: (ip) => `https://check.spamhaus.org/results/?query=${ip}`,
        info:    "IPs Spamhaus recommends avoiding for receiving email",
    },
    {
        name:    "Spamhaus PBL",
        domain:  "pbl.spamhaus.org",
        removal: (ip) => `https://check.spamhaus.org/results/?query=${ip}`,
        info:    "End-user IP ranges that should not send unauthenticated SMTP",
    },
    {
        name:    "Spamhaus ZEN",
        domain:  "zen.spamhaus.org",
        removal: (ip) => `https://check.spamhaus.org/results/?query=${ip}`,
        info:    "Combined Spamhaus SBL, XBL and PBL zones",
    },
    {
        name:    "Barracuda Central",
        domain:  "b.barracudacentral.org",
        removal: () => "https://www.barracudacentral.org/rbl/removal-request/",
        info:    "Real-time DB of IPs with poor email reputation",
    },
    {
        name:    "0SPAM",
        domain:  "bl.0spam.org",
        removal: () => "https://0spam.org/request",
        info:    "IPs that sent spam to 0spam traps",
    },
    {
        name:    "SpamCop",
        domain:  "bl.spamcop.net",
        removal: () => "https://www.spamcop.net/bl.shtml",
        info:    "Tracks origin of unwanted email",
    },
    {
        name:    "S5H Blacklist",
        domain:  "all.s5h.net",
        removal: () => "https://www.usenix.org.uk/content/rblremovehelp",
        info:    "Real-time IP blacklist by System 5 Hosting",
    },
    {
        name:    "UCEPROTECT L1",
        domain:  "dnsbl-1.uceprotect.net",
        removal: () => "https://www.uceprotect.net/en/rblcheck.php",
        info:    "Individual IPs associated with spam",
    },
    {
        name:    "UCEPROTECT L2",
        domain:  "dnsbl-2.uceprotect.net",
        removal: () => "https://www.uceprotect.net/en/rblcheck.php",
        info:    "IP ranges with high spam activity",
    },
    {
        name:    "UCEPROTECT L3",
        domain:  "dnsbl-3.uceprotect.net",
        removal: () => "https://www.uceprotect.net/en/rblcheck.php",
        info:    "ASNs with excessive spam sources",
    },
];

export default PRIORITY_DNSBLS;