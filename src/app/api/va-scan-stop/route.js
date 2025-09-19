import { NextResponse } from "next/server";

export async function POST(req) {
    const { searchParams } = new URL(req.url);
    const scan_id = searchParams.get("scan_id");
    if (!scan_id) return NextResponse.json({ error: "scan_id required" }, { status: 400 });

    const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";
    const url = `https://api.projectdiscovery.io/v1/scans/${scan_id}/stop`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "X-API-Key": API_KEY }
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}