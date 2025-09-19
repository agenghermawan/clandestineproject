import { NextResponse } from "next/server";
const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

export async function GET(req) {
    const urlObj = new URL(req.url);
    const scan_id = urlObj.searchParams.get("scan_id");
    const limit = urlObj.searchParams.get("limit") || "1000";
    const offset = urlObj.searchParams.get("offset") || "0";
    const sort_desc = urlObj.searchParams.get("sort_desc") || "severity";
    const vuln_status = urlObj.searchParams.get("vuln_status") || "open,triaged,fix_in_progress";
    const severity = urlObj.searchParams.get("severity") || "critical,high,medium,low,unknown,info";

    const metaUrl = `https://api.projectdiscovery.io/v1/scans/${scan_id}`;
    const findingsUrl = `https://api.projectdiscovery.io/v1/scans/results/filters?type=template&limit=${limit}&offset=${offset}&scan_id=${scan_id}&sort_desc=${sort_desc}&vuln_status=${vuln_status}&severity=${severity}`;

    try {
        const scanRes = await fetch(metaUrl, { headers: { "X-API-Key": API_KEY } });
        const scan = await scanRes.json();

        const resRes = await fetch(findingsUrl, { headers: { "X-API-Key": API_KEY } });
        const results = await resRes.json();

        console.log(JSON.stringify(results));

        return NextResponse.json({ scan, results: results.data || [], total: results.total || 0 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}