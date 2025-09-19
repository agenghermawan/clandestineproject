import React, { useEffect, useState } from "react";

// Utility
function formatAgo(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    if (isNaN(diffMs)) return "-";
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMo = Math.floor(diffDay / 30);
    return `${diffMo}mo ago`;
}

const statusColors = {
    200: "bg-green-900 text-green-400",
    401: "bg-orange-900 text-orange-400",
    400: "bg-orange-900 text-orange-400",
    500: "bg-red-900 text-red-400",
    default: "bg-gray-900 text-gray-400"
};

const API_KEY = "cf9452c4-7a79-4352-a1d3-9de3ba517347";

function getStatusColor(code) {
    return statusColors[code] || statusColors.default;
}

export default function AssetGroupModal({ open, onClose, groupId }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!open || !groupId) return;
        setIsLoading(true);
        const offset = (page - 1) * size;
        const options = {
            method: "GET",
            headers: { "X-API-Key": API_KEY },
        };
        fetch(`https://api.projectdiscovery.io/v1/asset/enumerate/${groupId}/contents?offset=${offset}&limit=${size}`, options)
            .then(res => res.json())
            .then(res => {
                setData(Array.isArray(res.data) ? res.data : []);
                // Use total_results or result_count, fallback to data.length for demo
                const total = typeof res.total_results === 'number' ? res.total_results :
                    typeof res.result_count === 'number' ? res.result_count : (res.data ? res.data.length : 0);
                setTotalResults(total);
                setTotalPages(total > 0 ? Math.ceil(total / size) : 1);
            })
            .finally(() => setIsLoading(false));
    }, [open, groupId, page, size]);

    // Tabs (dummy, for UI only)
    const tabs = ["All Services"];
    const [activeTab, setActiveTab] = useState(0);

    if (!open) return null;

    const from = totalResults === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(page * size, totalResults);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-2">
            <div className="relative w-full max-w-6xl bg-[#18181c] rounded-2xl shadow-2xl">
                <button
                    className="absolute top-6 right-8 text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close"
                    onClick={onClose}
                >×</button>
                <div className="px-8 pt-8 pb-6">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-6">
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(idx)}
                                className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                                    activeTab === idx
                                        ? "bg-[#23232b] text-white"
                                        : "bg-transparent text-gray-400 hover:text-white"
                                }`}
                            >{tab}</button>
                        ))}
                    </div>
                    <div className="overflow-auto" style={{ maxHeight: "64vh" }}>
                        {isLoading ? (
                            <div className="text-center py-16 text-pink-400 font-bold text-lg">Loading...</div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 font-bold text-lg">No services found</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {data.map((item, idx) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start bg-[#19191d] rounded-xl shadow p-4 border border-gray-800">
                                        {/* Screenshot */}
                                        <div className="w-[260px] h-[180px] flex items-center justify-center bg-[#23232b] rounded-xl overflow-hidden border border-gray-900 shrink-0">
                                            {item.screenshot_path ? (
                                                <img
                                                    src={item.screenshot_path}
                                                    alt={item.title || item.name}
                                                    className="object-cover w-full h-full"
                                                    style={{ maxWidth: 260, maxHeight: 180 }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center w-full h-full text-gray-600">
                                                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <rect width="24" height="24" rx="4" fill="#21222b"/>
                                                        <path d="M8 8h8v8H8V8z" stroke="#444" strokeWidth="2"/>
                                                    </svg>
                                                    <span className="mt-2">No screenshot</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded font-bold text-xs ${getStatusColor(item.status_code)}`}>
                                                    {item.status_code}
                                                </span>
                                                <span className="font-mono text-lg text-white">{item.host}{item.port ? `:${item.port}` : ""}</span>
                                                <a
                                                    href={item.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-3 text-blue-400 underline font-mono text-xs"
                                                >{item.name}</a>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {/* ASN/ IP / Country */}
                                                {item.asn && (
                                                    <span className="bg-[#20202b] text-gray-200 px-2 py-1 rounded text-xs font-mono">
                                                        ASN: {item.asn.as_number} | {item.asn.as_name} | {item.ip && item.ip.join(', ')}
                                                    </span>
                                                )}
                                                {/* Labels */}
                                                {Array.isArray(item.labels) && item.labels.length > 0 && item.labels.map((lbl, i) => (
                                                    <span key={lbl + i} className="bg-[#23232b] px-2 py-1 rounded text-xs text-gray-300 border border-gray-700">{lbl}</span>
                                                ))}
                                                {/* Add labels button */}
                                                <button className="bg-[#23232b] px-2 py-1 rounded text-xs text-gray-400 border border-dashed border-gray-600">
                                                    + Add labels
                                                </button>
                                            </div>
                                            {/* Title */}
                                            <div className="mt-2 font-bold text-white">{item.title || item.name}</div>
                                            {/* Technologies */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* Technologies badges (dummy, since empty) */}
                                                {Object.keys(item.technology_details || {}).length === 0 && (
                                                    <span className="bg-[#21222b] px-4 py-1 rounded text-xs text-gray-500 border border-gray-800">No technologies</span>
                                                )}
                                            </div>
                                            {/* SSL/Cert, Source, Age */}
                                            <div className="flex flex-wrap gap-2 mt-3 items-center">
                                                {/* SSL expiry badge (dummy) */}
                                                <span className="bg-green-900 text-green-400 px-3 py-1 rounded-full text-xs font-bold">SSL (150d to expire)</span>
                                                {/* Source */}
                                                <span className="bg-[#23232b] text-gray-200 px-3 py-1 rounded text-xs font-mono border border-gray-700">Fortinet</span>
                                                {/* Domain */}
                                                <span className="bg-[#23232b] text-gray-200 px-3 py-1 rounded text-xs font-mono border border-gray-700">{item.domain_name}</span>
                                                {/* Age */}
                                                <span className="text-gray-400 ml-2">{formatAgo(item.updated_at)}</span>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-8 px-2 py-2 text-gray-400 text-xs">
                        <div>
                            <select
                                className="bg-[#23232b] px-2 py-1 rounded border border-gray-700 text-gray-200"
                                value={size}
                                onChange={e => {
                                    setSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} per page</option>)}
                            </select>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}