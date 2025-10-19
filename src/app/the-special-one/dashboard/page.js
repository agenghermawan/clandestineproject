"use client";
import React, { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import Sidebar from "../../../components/dashboard/sidebar";

const initialStats = [
    { label: "Email", value: 26102688785 },
    { label: "Password", value: 13342389831 },
    { label: "Full name", value: 12801652751 },
    { label: "Telephone", value: 11694818802 },
    { label: "Nick", value: 10456573331 },
    { label: "Document number", value: 3657038761 },
];

function AdminDashboardStats() {
    const [stats, setStats] = useState(initialStats);
    const [trend, setTrend] = useState(generateTrend());

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
                const total = stats
                    .slice(0, 6)
                    .reduce((acc, s) => acc + (s.value + 2), 0);
                next.shift();
                next.push({
                    date: nextDate(last.date),
                    leaks: total / 1e9, // biar skalanya realistis
                });
                return next;
            });
        }, 1800000); // 30 menit

        return () => clearInterval(interval);
    }, [stats]);

    const totalLeaks = stats.reduce((acc, s) => acc + s.value, 0);

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#14121a] via-[#1a1b20] to-[#232339]">
            <Sidebar />
            <main className="flex-1 flex flex-col px-8 py-12 overflow-y-auto">
                <h1 className="text-3xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                    <FaChartLine className="text-pink-500" /> Data Leak Overview
                </h1>

                {/* Chart Trend */}
                {/*<div className="bg-[#1d1b26] border border-[#2a2a35] rounded-2xl p-6 mb-10 shadow-lg">*/}
                {/*    <h2 className="text-lg font-semibold text-gray-300 mb-4">*/}
                {/*        Leak Growth Trend*/}
                {/*    </h2>*/}
                {/*    <TrendChart data={trend} />*/}
                {/*</div>*/}

                {/* Grid 6 utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            </main>
        </div>
    );
}

function TrendChart({ data }) {
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
                    <stop stopColor="#f03262" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#232339" stopOpacity="0.1" />
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

// helper
function generateTrend() {
    const base = 100;
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
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

export default AdminDashboardStats;
