import "dotenv/config";

export async function getRoas(orgHandle) {
    const key = process.env.ARIN_API_KEY;

    const response = await fetch(
        `https://reg.arin.net/rest/roa/${orgHandle}?apikey=${key}`,
        { headers: { 'Accept': 'application/xml' } }
    );
    const xml = await response.text();

    const roaHandles = [...xml.matchAll(/<ns5:roaHandle>(.*?)<\/ns5:roaHandle>/g)].map(m => m[1]);
    const startAddresses = [...xml.matchAll(/<ns5:startAddress>(.*?)<\/ns5:startAddress>/g)]
        .map(m => m[1].split('.').map(Number).join('.')); // removes leading zeros e.g 072 → 72
    const cidrLengths = [...xml.matchAll(/<ns5:cidrLength>(.*?)<\/ns5:cidrLength>/g)].map(m => m[1]);
    const asNumbers = [...xml.matchAll(/<ns5:asNumber>(.*?)<\/ns5:asNumber>/g)].map(m => m[1]);

    const roas = roaHandles.map((handle, i) => ({
        roaHandle: handle,
        startAddress: startAddresses[i],
        cidrLength: cidrLengths[i],
        asNumber: asNumbers[i]
    }));

    console.log('Parsed ROAs:', roas); // verify the match now
    return roas;
}

export async function rpkiDelete(roaHandles, orgHandle) {
    const key = process.env.ARIN_API_KEY;

    const handleXml = roaHandles
        .map(h => `<roaHandle autoLink="false">${h}</roaHandle>`)
        .join('\n');

    const body = `<?xml version="1.0" encoding="UTF-8"?>
                <rpkiTransaction xmlns="http://www.arin.net/regrws/rpki/v1">
                <roaSpecDelete>
                    ${handleXml}
                </roaSpecDelete>
                </rpkiTransaction>`;

    const response = await fetch(
        `https://reg.arin.net/rest/rpki/${orgHandle}?apikey=${key}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml'  // changed from application/json
            },
            body
        }
    );

    const text = await response.text(); // changed from .json()
    console.log('Delete response:', text);

    // Check if success or error
    if (/<error[\s>]/i.test(text)) {
        return { error: text };
    }
    return { success: true };
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function rpkiCreate(ips, asn, roa, orgHandle) {
    const key = process.env.ARIN_API_KEY;
    const results = [];

    for (const ip of ips) {  // for...of waits properly, map() doesn't
        const [startAddress, cidrLength] = ip.split('/');

        const body = `<?xml version="1.0" encoding="UTF-8"?>
                        <rpkiTransaction xmlns="http://www.arin.net/regrws/rpki/v1">
                        <roaSpecAdd>
                            <roaSpec>
                            <autoLink>true</autoLink>
                            <asNumber>${asn}</asNumber>
                            <name>${roa}</name>
                            <resources>
                                <roaSpecResource>
                                <startAddress>${startAddress}</startAddress>
                                <cidrLength>${cidrLength}</cidrLength>
                                <maxLength>${cidrLength}</maxLength>
                                </roaSpecResource>
                            </resources>
                            </roaSpec>
                        </roaSpecAdd>
                        </rpkiTransaction>`;

        const response = await fetch(
            `https://reg.arin.net/rest/rpki/${orgHandle}?apikey=${key}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml'
                },
                body
            }
        );

        const text = await response.text();
        console.log(`Create response for ${ip}:`, text);

        results.push({
            ip,
            success: !/<error[\s>]/i.test(text),
            raw: text
        });

        await sleep(2000);  // 2s between each creation request
    }

    return results;
}