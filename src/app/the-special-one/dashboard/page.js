"use client";
import React, {useEffect, useState, useRef} from "react";
import {FaChartLine} from "react-icons/fa";
import Sidebar from "../../../components/dashboard/sidebar";
import {useAuth} from "../../../context/AuthContext";
import {useRouter} from "next/navigation";

const initialStats = [
    {label: "Email", value: 26102688785},
    {label: "Password", value: 13342389831},
    {label: "Full name", value: 12801652751},
    {label: "Telephone", value: 11694818802},
    {label: "Nick", value: 10456573331},
    {label: "Document number", value: 3657038761},
];

export default function AdminDashboardStats() {
    const {authState} = useAuth();
    const router = useRouter();

    // leak stats
    const [stats, setStats] = useState(initialStats);
    const [trend, setTrend] = useState(generateTrend());

    // users state (from your fetchUsers snippet)
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState(null);

    // trend for users counts (for the small chart)
    const [userTrend, setUserTrend] = useState([]);
    const userTrendRef = useRef([]);

    useEffect(() => {
        if (authState === "unauthenticated") {
            router.replace("/login");
        }
    }, [authState, router]);

    if (authState === "loading") {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#14121a] via-[#1a1b20] to-[#232339]">
                <div className="text-center">
                    <svg className="mx-auto animate-spin h-10 w-10 text-pink-400 mb-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20"/>
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="text-gray-400">Checking authentication...</div>
                </div>
            </div>
        );
    }

    if (authState === "unauthenticated") {
        return null;
    }

    // -------------------
    // Users fetching logic
    // -------------------
    const fetchUsers = async (params = {}) => {
        setLoadingUsers(true);
        setUsersError(null);
        try {
            const qp = new URLSearchParams({
                page: params.page ?? page,
                size: params.size ?? size,
                search: params.search ?? search,
            });
            const res = await fetch(`/api/special-one/users?${qp.toString()}`, {
                method: "GET",
            });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data = await res.json();
            setUsers(data.data || []);
            setTotal(data.pagination?.total ?? 0);
            setPages(data.pagination?.pages ?? 1);

            // update user trend (keep last 12 points)
            const nextVal = data.pagination?.total ?? 0;
            userTrendRef.current = [...userTrendRef.current, { t: new Date().toISOString(), v: nextVal }].slice(-12);
            setUserTrend([...userTrendRef.current]);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setUsers([]);
            setTotal(0);
            setPages(1);
            setUsersError("Failed to fetch users");
        } finally {
            setLoadingUsers(false);
        }
    };

    // initial load and when page/size/search changes
    useEffect(() => {
        fetchUsers({page, size, search});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, search]);

    // optional polling to refresh users/total (every 60s)
    useEffect(() => {
        const id = setInterval(() => {
            fetchUsers({page, size, search});
        }, 60000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, search]);

    // -------------------
    // leak stats interval (your original logic)
    // -------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setStats((prev) =>
                prev.map((item) => ({
                    ...item,
                    value: item.value + 2,
                }))
            );

            // update chart trend
            setTrend((prev) => {
                const next = [...prev];
                const last = prev[prev.length - 1];
                const totalLeaks = stats
                    .slice(0, 6)
                    .reduce((acc, s) => acc + (s.value + 2), 0);
                next.shift();
                next.push({
                    date: nextDate(last.date),
                    leaks: totalLeaks / 1e9, // keep scale realistic
                });
                return next;
            });
        }, 1800000); // 30 minutes

        return () => clearInterval(interval);
    }, [stats]);

    const totalLeaks = stats.reduce((acc, s) => acc + s.value, 0);

    // -------------------
    // Small helpers for rendering user chart (sparkline)
    // -------------------
    function renderUserSparkline(data = [], w = 240, h = 48) {
        if (!data || data.length === 0) {
            // placeholder empty sparkline
            return (
                <svg width={w} height={h} className="w-full h-12">
                    <text x="8" y="16" fill="#777" fontSize="11">no trend</text>
                </svg>
            );
        }
        const values = data.map((d) => d.v);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const len = values.length;
        const pad = 4;
        const step = (w - pad * 2) / Math.max(1, len - 1);
        const points = values.map((v, i) => {
            const x = pad + i * step;
            // normalize
            const ratio = max === min ? 0.5 : (v - min) / (max - min);
            const y = h - pad - ratio * (h - pad * 2);
            return [x, y];
        });
        const poly = points.map((p) => p.join(",")).join(" ");
        const area = [[pad, h - pad], ...points, [w - pad, h - pad]].map((p) => p.join(",")).join(" ");
        return (
            <svg width={w} height={h} className="w-full h-12">
                <defs>
                    <linearGradient id="ugrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#f03262" stopOpacity="0.18" />
                        <stop offset="1" stopColor="#232339" stopOpacity="0.06" />
                    </linearGradient>
                </defs>
                <polygon points={area} fill="url(#ugrad)" />
                <polyline points={poly} fill="none" stroke="#f03262" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {points.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#f03262" stroke="#fff" strokeWidth="0.6" />
                ))}
            </svg>
        );
    }

    // -------------------
    // Render
    // -------------------
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#14121a] via-[#1a1b20] to-[#232339]">
            <Sidebar/>
            <main className="flex-1 flex flex-col px-8 py-12 overflow-y-auto">
                <h1 className="text-3xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                    <FaChartLine className="text-pink-500"/> Data Leak & Users Overview
                </h1>

                {/* Top leak cards (same as before) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((item, i) => (
                        <div
                            key={i}
                            className="bg-gradient-to-tr from-[#23232b] via-[#19191d] to-[#23232b] shadow-lg rounded-xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300 border border-[#2a2a35]"
                        >
                            <div className="text-sm text-gray-400 font-semibold mb-1">
                                {item.label}
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {item.value.toLocaleString("en-US")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* USERS SECTION */}
                <section className="bg-[#15151a] border border-[#27272f] rounded-2xl p-6 mb-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Users Overview</h2>
                            <p className="text-sm text-gray-400">Summary of user counts and recent signups.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search users..."
                                className="bg-[#0f0f12] border border-[#23232b] px-3 py-1 rounded text-sm text-white"
                            />
                            <button
                                onClick={() => fetchUsers({page: 1, size, search})}
                                className="bg-[#f03262] hover:bg-[#d82a56] text-white px-3 py-1 rounded text-sm"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-tr from-[#17171b] to-[#0f0f12] p-4 rounded-lg border border-[#23232b]">
                            <div className="text-xs text-gray-400">Total Users</div>
                            <div className="text-2xl font-bold text-white">{loadingUsers ? "..." : total.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 mt-2">Pages: {pages} • Per page: {size}</div>
                        </div>

                        <div className="bg-gradient-to-tr from-[#17171b] to-[#0f0f12] p-4 rounded-lg border border-[#23232b]">
                            <div className="text-xs text-gray-400">Showing</div>
                            <div className="text-2xl font-bold text-white">{users.length.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 mt-2">Recent results (this page)</div>
                        </div>

                    </div>

                    {/* small sample list */}
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-mono bg-transparent">
                                <thead>
                                <tr className="text-left text-xs text-pink-400 uppercase">
                                    <th className="py-2 px-2">No</th>
                                    <th className="py-2 px-2">ID</th>
                                    <th className="py-2 px-2">Created</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingUsers ? (
                                    <tr><td colSpan="4" className="p-4 text-gray-400">Loading users...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-gray-400">{usersError || "No users found"}</td></tr>
                                ) : (
                                    users.slice(0, 10).map((u, idx) => (
                                        <tr key={u.id || u._id || idx} className="border-t border-[#222]">
                                            <td className="py-2 px-2 text-pink-400">{(page - 1) * size + idx + 1}</td>
                                            <td className="py-2 px-2 text-white">
                                                {u.email || u.username || u.id || u._id || "-"}
                                            </td>
                                            <td className="py-2 px-2 text-gray-400">
                                                {u.created_at ? new Date(u.created_at).toLocaleString() : (u.createdAt ? new Date(u.createdAt).toLocaleString() : "-")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* pagination controls */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                                Showing {(page - 1) * size + 1} - {Math.min(page * size, total)} of {total.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`px-3 py-1 rounded ${page === 1 ? "bg-[#212125] text-gray-500 cursor-not-allowed" : "bg-[#23242a] text-white"}`}
                                >
                                    Prev
                                </button>
                                <div className="text-xs text-gray-300 px-2">Page {page} / {pages}</div>
                                <button
                                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    className={`px-3 py-1 rounded ${page === pages ? "bg-[#212125] text-gray-500 cursor-not-allowed" : "bg-[#23242a] text-white"}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

// -------------------- helpers (trend chart + leak helpers) --------------------
function TrendChart({data}) {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map((d) => d.leaks));
    const w = 700,
        h = 200,
        pad = 24;
    const step = (w - pad * 2) / (data.length - 1);

    const points = data.map((d, i) => {
        const x = pad + i * step;
        const y = h - pad - (d.leaks / max) * (h - pad * 2);
        return [x, y];
    });

    const areaPoints = [[pad, h - pad], ...points, [w - pad, h - pad]];

    return (
        <svg width={w} height={h} className="w-full h-auto">
            <defs>
                <linearGradient id="neonArea" x1="0" y1="0" x2="0" y2={h}>
                    <stop stopColor="#f03262" stopOpacity="0.4"/>
                    <stop offset="1" stopColor="#232339" stopOpacity="0.1"/>
                </linearGradient>
            </defs>

            <polygon
                points={areaPoints.map((p) => p.join(",")).join(" ")}
                fill="url(#neonArea)"
            />
            <polyline
                points={points.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="#f03262"
                strokeWidth="3"
            />

            {points.map(([x, y], i) => (
                <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#f03262"
                    stroke="#fff"
                    strokeWidth="2"
                />
            ))}

            {data.map((d, i) => (
                <text
                    key={i}
                    x={pad + i * step}
                    y={h - pad + 18}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#888"
                >
                    {d.date.slice(5)}
                </text>
            ))}
        </svg>
    );
}

function generateTrend() {
    const base = 100;
    const now = new Date();
    return Array.from({length: 10}, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (9 - i));
        return {
            date: d.toISOString().split("T")[0],
            leaks: base + i * Math.floor(Math.random() * 20 + 10),
        };
    });
}

function nextDate(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}