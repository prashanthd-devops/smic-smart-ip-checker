import { WebServiceClient } from "@maxmind/geoip2-node";

const accountId = process.env.MAXMIND_ACCOUNT_ID;
const licenseKey = process.env.MAXMIND_LICENSE_KEY;
const client = new WebServiceClient(accountId, licenseKey, {
    host: "geolite.info",
    
});


export default async function geoFeeds(ip) {
// const mm = await client.city(ip);
const ipinfoToken = process.env.IPINFO_TOKEN;
const ip2locationKey = process.env.IP2LOCATION_KEY;
const iphubKey = process.env.IPHUB_KEY;

    const [
        maxmind,
        ipinfo,
        ip2location,
        iphub
    ] = await Promise.allSettled([

        client.city(ip),

        fetch(
            `https://api.ipinfo.io/lite/${ip}?token=${ipinfoToken}`
        ).then(async (res) => {
            if (!res.ok) {
                throw new Error(`IPInfo: ${res.status}`);
            }
            return res.json();
        }),

        fetch(
            `https://api.ip2location.io/?key=${ip2locationKey}&ip=${ip}`
        ).then(async (res) => {
            if (!res.ok) {
                throw new Error(`IP2Location: ${res.status}`);
            }
            return res.json();
        }),

        fetch(
            `https://v2.api.iphub.info/ip/${ip}`,
            {
                headers: {
                    "X-Key": iphubKey,
                    "Accept-Version": "2.2"
                }
            }
        ).then(async (res) => {
            if (!res.ok) {
                throw new Error(`IPHub: ${res.status}`);
            }
            return res.json();
        })

    ]);

    return {
        ip,
        Maxmind: {
            country: maxmind.value?.country?.names?.en || "NA",
            asn: maxmind.value?.traits?.autonomousSystemNumber || "NA",
            Org: maxmind.value?.traits?.autonomousSystemOrganization || "NA"
        },
        Ipinfo: {
            country: ipinfo.value?.country || "NA",
            asn: ipinfo.value?.asn || "NA",
            Org: ipinfo.value?.as_name || "NA"
        },
        Ip2location: {
            country: ip2location.value?.country_name || "NA",
            asn: ip2location.value?.asn || "NA",
            Org: ip2location.value?.as || "NA"
        },
        Iphub: {
            country: iphub.value?.countryName || "NA",
            asn: iphub.value?.asn || "NA",
            Org: iphub.value?.isp || "NA"
        }
    };
}



