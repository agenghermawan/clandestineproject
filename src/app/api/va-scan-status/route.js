import { NextResponse } from "next/server";
const API_KEY = process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const scan_id = searchParams.get("scan_id");
    if (!scan_id) return NextResponse.json({ error: "No scan_id" }, { status: 400 });

    // Ambil status scan
    const res = await fetch(`https://api.projectdiscovery.io/v1/scans/${scan_id}`, {
        headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" }
    });
    const scanData = await res.json();

    // (Optional) Ambil hasil vulnerabilities kalau sudah finished
    let vulnData = null;
    if (scanData.status === "finished") {
        const vulnRes = await fetch(`https://api.projectdiscovery.io/v1/scans/${scan_id}/results/vulnerabilities`, {
            headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" }
        });
        vulnData = await vulnRes.json();
    }

    return NextResponse.json({
        status: scanData.status,
        progress: scanData.progress,
        vulnerabilities: vulnData?.data || [],
    });
}