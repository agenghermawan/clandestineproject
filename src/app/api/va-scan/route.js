import { NextResponse } from "next/server";

const API_KEY =
  process.env.PD_API_KEY || "cf9452c4-7a79-4352-a1d3-9de3ba517347";

// Next.js API Route: POST /api/va-scan
export async function POST(req) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return NextResponse.json(
        { error: "No domain provided" },
        { status: 400 }
      );
    }

    // Prepare payload
    const payload = {
      targets: [domain.trim()],
      recommended: true,
      scan_type: "nuclei",
      name: `Scan for ${domain.trim()} ~ Clandestine (recommended)`,
    };

    // Submit scan request to ProjectDiscovery API
    const scanRes = await fetch("https://api.projectdiscovery.io/v1/scans", {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const scanData = await scanRes.json();

    if (!scanRes.ok || !scanData.id) {
      return NextResponse.json(
        { error: scanData.message || JSON.stringify(scanData) },
        { status: 502 }
      );
    }

    return NextResponse.json({
      scan_id: scanData.id,
      status: scanData.status || "queued",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
