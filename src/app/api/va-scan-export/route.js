import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const scan_id = searchParams.get("scan_id");
    const type = searchParams.get("type") || "csv";
    const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

    const url = `https://api.projectdiscovery.io/v1/scans/${scan_id}/export?type=${type}&async=false`;

    const upstream = await fetch(url, {
        method: "GET",
        headers: { "X-API-Key": API_KEY }
    });
    if (!upstream.ok) {
        const err = await upstream.text();
        return NextResponse.json({ error: err }, { status: upstream.status });
    }
    const contentType =
        type === "csv" ? "text/csv"
            : type === "json" ? "application/json"
                : type === "pdf" ? "application/pdf"
                    : "application/octet-stream";
    const filename = `scan-${scan_id}.${type}`;
    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}