import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request, { params }) {
    const { id } = params;
    const cookiesStore = await cookies();
    const token = cookiesStore.get("token")?.value;

    try {
        const res = await fetch(`http://103.245.181.5:5001/admin/users/${id}/make-admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to make user admin" },
                { status: res.status }
            );
        }

        return NextResponse.json({ message: "User promoted to admin", data });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
