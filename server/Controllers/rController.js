export default async function routeValidate(ip) {
    const subnet = ip;

    const irrURL = process.env.IRR_URL;

    try {
        const data = await fetch(`${irrURL}${subnet}`);

        if (!data.ok) {
            throw new Error(`result: ${data.status}`);
        }

        return await data.json();   
    } catch (err) {
        return { error: err.message }; 
    }
}
