export const dynamic = 'force-dynamic';

export async function GET(req) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return new Response(
            JSON.stringify({ message: "Unauthorized: Token missing" }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const res = await fetch(`http://103.245.181.5:5001/my-plan`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    // Jika backend kamu balikin 404/no plan, tangani di sini:
    if (res.status === 404) {
        return new Response(JSON.stringify({
            data: null,
            message: "No active plan."
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Jika backend balikin data kosong/null:
    const data = await res.json();
    if (!data || !data.data) {
        return new Response(JSON.stringify({
            data: null,
            message: "No active plan."
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
    });
}