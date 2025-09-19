import { NextResponse } from "next/server";
const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort_asc = searchParams.get("sort_asc") || "";
    const sort_desc = searchParams.get("sort_desc") || "";

    const offset = (page - 1) * size;
    const params = new URLSearchParams({
        offset: offset.toString(),
        limit: size.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (sort_asc) params.append("sort_asc", sort_asc);
    if (sort_desc) params.append("sort_desc", sort_desc);

    const apiUrl = `https://api.projectdiscovery.io/v1/scans?${params.toString()}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "X-API-Key": API_KEY,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        console.log("89 " + JSON.stringify(data.data));

        return NextResponse.json({
            scans: data.data,
            total: data.total,
            count: data.count
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}