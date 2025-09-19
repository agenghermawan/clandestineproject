export async function GET(request) {
    const { search } = new URL(request.url);
    const url = `http://103.245.181.5:5001/search/download${search}`;
    const response = await fetch(url, { method: "GET" });
    const html = await response.text();
    return new Response(html, {
        status: response.status,
        headers: { "Content-Type": "text/html" },
    });
}