const PRIORITY_DNSBLS = [
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