import dns from "dns/promises";
import DNSBLS from "../DNSBLS/dnsblLists.js";

export default async function ipConvertion(subnet) {

    const [ip, cidr = "32"] = subnet.split("/");
    
    const [a, b, c, d]      = ip.split(".").map(Number);

    const prefixLen = Number(cidr);
    const hostCount = 2 ** (32 - prefixLen);   // /29 → 8,  /32 → 1

    const reverseIps = [];
    const ips = [];
    for (let i = 0; i < hostCount; i++) {
        reverseIps.push(`${d + i}.${c}.${b}.${a}`);
        ips.push(`${a}.${b}.${c}.${d+i}`);
    }

    return checkDnsbl(reverseIps,ips);
}

const PRIORITY_DNSBLS = DNSBLS;

async function checkDnsbl(reverseIps,ips){
    const resultArray=[];
        await Promise.all(reverseIps.map(async (r,index)=>{
                await Promise.allSettled(PRIORITY_DNSBLS.map(async (dnsbl) => {
                    const lookup = `${r}.${dnsbl.domain}`;
                    
                    try {
                        const dnsQuery = await dns.resolve4(`${lookup}`)
                        const listed = dnsQuery.some(ip => ip.startsWith("127."));
                        if(listed === true){
                            resultArray.push({
                                ip: ips[index],
                                listedOn: dnsbl.domain,
                                removalLink: dnsbl.removal(ips[index])
                            })
                        }
                    } catch {
                    }
                }))
        }))
    return resultArray;
}

