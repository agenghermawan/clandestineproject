export const dynamic = 'force-dynamic';

export async function POST(req) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized: No token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    let body;
    try {
        body = await req.json();
    } catch {
        body = {};
    }
    const res = await fetch("http://103.245.181.5:5001/register-breach-domain", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            selected_domains: Array.isArray(body.selected_domains)
                ? body.selected_domains
                : [body.selected_domains]
        }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}