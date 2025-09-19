import { NextResponse } from "next/server";

const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const domains = searchParams.get("domains");
    const limit = searchParams.get("limit") || 20;
    const offset = searchParams.get("offset") || 0;
    if (!domains) {
        return NextResponse.json({ error: "No domains provided" }, { status: 400 });
    }

    const domainArr = domains.split(",").map(d => d.trim()).filter(Boolean);
    const results = [];

    for (const domain of domainArr) {
        const url = `https://api.projectdiscovery.io/v1/asset/enumerate/contents?limit=${limit}&offset=${offset}&domain=${encodeURIComponent(domain)}`;
        const res = await fetch(url, {
            headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" }
        });
        if (!res.ok) continue;
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
        (data.data || []).forEach(item => {
            item._domain = domain;
            results.push(item);
        });
    }

    return NextResponse.json({ data: results });
}