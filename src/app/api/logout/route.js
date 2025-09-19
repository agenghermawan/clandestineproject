import { NextResponse } from "next/server";

export async function POST(req) {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Hapus token dari cookies
    response.cookies.delete("token", { path: "/" });

    return response;
}
