import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const scan_id = searchParams.get("scan_id");
    const templates = searchParams.get("templates"); // <-- plural!
    const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

    if (!scan_id || !templates) {
        return NextResponse.json({ error: "Missing scan_id or templates" }, { status: 400 });
    }

    console.log("ScanId", scan_id);
    console.log("templates", templates);

    const url = `https://api.projectdiscovery.io/v1/scans/result/${scan_id}?limit=20&offset=0&asset_metadata=true&vuln_status=open,triaged,fix_in_progress&severity=critical,high,medium,low,unknown,info&templates=${templates}`;
    const pdRes = await fetch(url, {
        headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json"
        }
    });

    if (!pdRes.ok) {
        const err = await pdRes.text();
        return NextResponse.json({ error: err }, { status: pdRes.status });
    }

    const data = await pdRes.json();
    return NextResponse.json({ data: data.data || [] });
}