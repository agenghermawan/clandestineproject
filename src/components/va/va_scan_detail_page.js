import React, { useState, useEffect } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import AssetDetailModal from "../../components/va/va_detail_modal";
import VAScannerLoader from "../../components/va/va_scanner_loader";

// --- Severity Badge ---
const severityColors = {
    critical: "bg-red-700 text-red-100",
    high: "bg-orange-600 text-orange-50",
    medium: "bg-yellow-500 text-yellow-50",
    low: "bg-blue-900 text-blue-100",
    info: "bg-blue-900 text-blue-100",
    unknown: "bg-gray-800 text-gray-100",
};
function Badge({ level }) {
    const color = severityColors[level] || "bg-gray-700 text-gray-300";
    return (
        <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${color}`}>
      {level?.charAt(0).toUpperCase() + level?.slice(1)}
    </span>
    );
}
function IconAsset() {
    return (
        <svg width="18" height="18" fill="none" className="inline mr-1 -mt-1">
            <circle cx="9" cy="9" r="8" stroke="#888" strokeWidth="1.5" fill="none"/>
            <path d="M9 12.5c-2.5 0-4-1.2-4-2.5s1.5-2.5 4-2.5 4 1.2 4 2.5-1.5 2.5-4 2.5z" fill="#888"/>
            <circle cx="9" cy="7.5" r="1.3" fill="#888"/>
        </svg>
    );
}
function IconFound() {
    return (
        <svg width="18" height="18" fill="none" className="inline mr-1 -mt-1">
            <rect x="3" y="3" width="12" height="12" rx="3" stroke="#888" strokeWidth="1.5" fill="none"/>
            <text x="9" y="13" textAnchor="middle" fontSize="12" fill="#888">{'{}'}</text>
        </svg>
    );
}
function IconClock() {
    return (
        <svg width="18" height="18" fill="none" className="inline mr-1 -mt-1">
            <circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="1.5"/>
            <path d="M9 5.5v3.5l2 2" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
}
function formatRelativeTime(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function ScanDetailPage({ scanId }) {
    const [loading, setLoading] = useState(true);
    const [scan, setScan] = useState(null);
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ severity: [], status: [] });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(20);

    // Accordion state
    const [expanded, setExpanded] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [detailError, setDetailError] = useState("");

    // Asset detail modal state
    const [assetDetailOpen, setAssetDetailOpen] = useState(false);
    const [assetDetailItem, setAssetDetailItem] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/va-scan-detail?scan_id=${scanId}`)
            .then((res) => res.json())
            .then((data) => {
                setScan(data.scan);
                setResults(data.results || []);
                setLoading(false);
            });
    }, [scanId]);

    // Filtered results
    const filtered = results.filter(r => {
        let ok = true;
        if (search) {
            const v = search.toLowerCase();
            ok = (r.title || r.name || "").toLowerCase().includes(v)
                || (r.value || "").toLowerCase().includes(v);
        }
        if (filters.severity.length) ok = ok && filters.severity.includes(r.severity);
        if (filters.status.length) ok = ok && filters.status.includes(r.status);
        return ok;
    });

    // Pagination
    const maxPage = Math.max(1, Math.ceil(filtered.length / size));
    const shown = filtered.slice((page - 1) * size, page * size);

    // Accordion click handler
    async function handleExpand(templateId) {
        if (expanded === templateId) {
            setExpanded(null);
            return;
        }
        setExpanded(templateId);
        setDetailError("");
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/va-scan-finding-detail?scan_id=${scanId}&templates=${encodeURIComponent(templateId)}`);
            const data = await res.json();
            setDetailData((prev) => ({
                ...prev,
                [templateId]: data.data || []
            }));
        } catch (e) {
            setDetailError("Failed to load detail");
        }
        setDetailLoading(false);
    }

    if (loading) return <VAScannerLoader status="Loading..." message="Please wait a moment" />;

    if (!scan) return <div className="text-center py-20 text-xl text-red-400">Scan not found</div>;

    return (
        <div className="w-11/12 max-w-6xl mx-auto px-3 py-10">
            <h1 className="font-bold text-2xl mb-4 text-white">{scan.name}</h1>
            {/* Top Search/Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search results"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="bg-[#18181c] border border-[#232339] px-4 py-2 rounded-lg text-white flex-1"
                />
                {/* Severity filter */}
                <div className="flex gap-2">
                    {["critical", "high", "medium", "low", "info"].map(sev => (
                        <button
                            key={sev}
                            className={`px-3 py-1 rounded-full font-bold text-xs border ${filters.severity.includes(sev)
                                ? "bg-pink-700 border-pink-700 text-white"
                                : "bg-[#232339] border-[#232339] text-gray-400"
                            }`}
                            onClick={() =>
                                setFilters(f => ({
                                    ...f,
                                    severity: f.severity.includes(sev)
                                        ? f.severity.filter(s => s !== sev)
                                        : [...f.severity, sev]
                                }))
                            }
                        >{sev.charAt(0).toUpperCase() + sev.slice(1)}</button>
                    ))}
                </div>
            </div>
            {/* Table */}
            <div className="rounded-lg border border-[#232339] bg-[#161622] overflow-x-auto">
                <table className="min-w-full font-mono">
                    <thead>
                    <tr className="border-b border-[#232339] text-xs text-gray-400 bg-[#191924]/90">
                        <th className="py-3 px-4 text-left">Severity</th>
                        <th className="py-3 px-4 text-left">Title</th>
                        <th className="py-3 px-4 text-left">Count</th>
                        <th className="py-3 px-4 text-left">Template</th>
                        <th className="py-3 px-4 text-left"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {shown.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">No results found.</td>
                        </tr>
                    ) : (
                        shown.map((r, idx) => {
                            const isExpanded = expanded === r.value;
                            return (
                                <React.Fragment key={`${r.id || r.value || "row"}-${idx}`}>
                                    <tr
                                        className="border-b border-[#232339] hover:bg-[#232339]/70 group cursor-pointer transition"
                                        tabIndex={0}
                                        onClick={() => handleExpand(r.value)}
                                        onKeyDown={e => e.key === "Enter" && handleExpand(r.value)}
                                        title="Click to view detail"
                                    >
                                        <td className="py-4 px-4"><Badge level={r.severity} /></td>
                                        <td className="py-4 px-4">{r.title || r.name}</td>
                                        <td className="py-4 px-4">{r.count || 1}</td>
                                        <td className="py-4 px-4">
                                            <span className="bg-black/40 border border-pink-700 px-3 py-1 rounded-full text-xs font-bold shadow-inner">{r.value}</span>
                                        </td>
                                        <td className="py-4 px-4">
                        <span className="bg-[#232339] px-2 py-1 rounded-full flex items-center gap-1 text-pink-400 text-xs font-bold">
                          TEMPLATE <span className="ml-2">{r.value_id || r.value}</span>
                            {isExpanded ? <MdArrowDropUp /> : <MdArrowDropDown />}
                        </span>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={5} className="bg-[#181825] p-0">
                                                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto border-t border-[#232339]">
                                                    {detailLoading ? (
                                                        <div className="text-center py-12 text-gray-300">Loading...</div>
                                                    ) : detailError ? (
                                                        <div className="text-center py-12 text-red-400">{detailError}</div>
                                                    ) : (
                                                        <table className="min-w-[900px] w-full font-mono text-base">
                                                            <thead>
                                                            <tr className="border-b border-[#232339] text-xs text-gray-400 bg-[#161622]/90">
                                                                <th className="py-3 px-4 text-left font-semibold"><IconAsset />Asset</th>
                                                                <th className="py-3 px-4 text-left font-semibold"><IconFound />Found at</th>
                                                                <th className="py-3 px-4 text-left font-semibold"><IconClock />First seen</th>
                                                                <th className="py-3 px-4 text-left font-semibold"><IconClock />Last seen</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {(detailData[r.value] || []).length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={4} className="py-8 text-center text-gray-500">No asset found.</td>
                                                                </tr>
                                                            ) : (
                                                                (detailData[r.value] || []).map((row, idy) => {
                                                                    const key = `${row.asset_metadata?.id ?? "noid"}-${idy}`;
                                                                    const event = row.event?.[0] || {};
                                                                    return (
                                                                        <tr
                                                                            key={key}
                                                                            className="border-b border-[#232339] hover:bg-[#232339]/40 cursor-pointer"
                                                                            onClick={() => {
                                                                                setAssetDetailItem(row);
                                                                                setAssetDetailOpen(true);
                                                                            }}
                                                                            title="Click to view asset detail"
                                                                        >
                                                                            <td className="py-4 px-4 font-medium text-white whitespace-nowrap">
                                                                                {row.asset_metadata?.host ?? row.target}
                                                                            </td>
                                                                            <td className="py-4 px-4 max-w-[540px]">
                                                                                <div className="flex items-center gap-2 overflow-x-auto">
                                                                                    <button
                                                                                        className="group/copy p-1 hover:bg-[#232339] rounded"
                                                                                        onClick={e => {
                                                                                            e.stopPropagation();
                                                                                            navigator.clipboard.writeText(event["matched-at"] || "");
                                                                                        }}
                                                                                        title="Copy"
                                                                                        tabIndex={-1}
                                                                                    >
                                                                                        <svg width="16" height="16" fill="none">
                                                                                            <rect width="12" height="12" x="2" y="2" rx="2" fill="#444" />
                                                                                            <rect width="10" height="10" x="3" y="3" rx="1" fill="#fff" />
                                                                                        </svg>
                                                                                    </button>
                                                                                    <div style={{
                                                                                        overflowX: 'auto',
                                                                                        maxWidth: 480,
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}>
                                                                                        <a
                                                                                            href={event["matched-at"]}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="text-pink-400 underline font-mono hover:text-pink-200"
                                                                                            title={event["matched-at"]}
                                                                                            style={{ display: 'inline-block', verticalAlign: 'middle', minWidth: '90px', maxWidth: 480, whiteSpace: 'nowrap', overflowX: 'auto' }}
                                                                                        >
                                                                                            {event["matched-at"]}
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-4 px-4 text-gray-300 whitespace-nowrap">{formatRelativeTime(row.created_at)}</td>
                                                                            <td className="py-4 px-4 text-gray-300 whitespace-nowrap">{formatRelativeTime(row.updated_at)}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            )}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-gray-500 text-xs">
                    Showing {(page - 1) * size + 1}-{Math.min(page * size, filtered.length)} of {filtered.length} results
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded bg-[#232339] text-white"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                    >{"<<"}</button>
                    <button
                        className="px-3 py-1 rounded bg-[#232339] text-white"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >{"<"}</button>
                    <span className="px-2">{page}</span>
                    <button
                        className="px-3 py-1 rounded bg-[#232339] text-white"
                        disabled={page === maxPage}
                        onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                    >{">"}</button>
                    <button
                        className="px-3 py-1 rounded bg-[#232339] text-white"
                        disabled={page === maxPage}
                        onClick={() => setPage(maxPage)}
                    >{">>"}</button>
                </div>
            </div>
            {/* Asset Detail Modal */}
            <AssetDetailModal
                open={assetDetailOpen}
                onClose={() => setAssetDetailOpen(false)}
                item={assetDetailItem}
            />
        </div>
    );
}