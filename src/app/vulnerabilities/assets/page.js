'use client';

import React, { useEffect, useState } from "react";
import { FaServer, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import AssetGroupModal from "../../../components/vurnerability/AssetGroupModal";

const API_KEY = "cf9452c4-7a79-4352-a1d3-9de3ba517347";

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

const tableHeadClasses =
    "py-3 px-4 text-xs font-semibold uppercase tracking-wide border-b border-gray-700 bg-[#19191c] text-gray-400";

const AssetGroups = () => {
    const router = useRouter();
    const { authState } = useAuth();

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalGroupId, setModalGroupId] = useState(null);

    // Data state
    const [allData, setAllData] = useState([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Registered domain (from /api/my-plan)
    const [registeredDomains, setRegisteredDomains] = useState([]);
    const [planReady, setPlanReady] = useState(false);

    // Expanded row for actions
    const [expandedRow, setExpandedRow] = useState(null);

    // Action modal (result & confirmation)
    const [actionModal, setActionModal] = useState({
        open: false,
        title: "",
        message: "",
        type: "success",
        confirm: false,
        onConfirm: null,
    });

    // Fetch all asset groups (no domain filter)
    const fetchAssetGroups = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", 500);
            params.append("offset", 0);
            const url = `https://api.projectdiscovery.io/v1/asset/enumerate?${params.toString()}`;
            const options = {
                method: "GET",
                headers: { "X-API-Key": API_KEY },
            };
            const res = await fetch(url, options);
            if (!res.ok) throw new Error("Failed to fetch asset groups");
            const result = await res.json();
            let assetGroups = Array.isArray(result.data) ? result.data : [];
            setAllData(assetGroups);
        } catch (e) {
            setAllData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch asset groups on page load and when refresh
    useEffect(() => {
        if (authState === "authenticated") {
            fetchAssetGroups();
        }
    }, [authState]);

    // Fetch plan + domain list sesuai tipe plan
    useEffect(() => {
        if (authState !== "authenticated") return;
        fetch("/api/my-plan", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                const isUnlimited = data?.data?.domain === "unlimited";
                // Pilih domain list sesuai tipe plan
                let domains = [];
                if (isUnlimited) {
                    domains = Array.isArray(data?.data?.registered_breach_domain)
                        ? data.data.registered_breach_domain
                        : [];
                } else {
                    domains = Array.isArray(data?.data?.registered_domain)
                        ? data.data.registered_domain
                        : [];
                }
                // Normalisasi domain: lowercase, tanpa protocol, tanpa slash akhir
                setRegisteredDomains(domains.map(d =>
                    d.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '')
                ));
                setPlanReady(true);
            })
            .catch(() => {
                setRegisteredDomains([]);
                setPlanReady(true);
            });
    }, [authState]);

    // FILTER asset group sesuai domain plan (langsung saat load/paging)
    useEffect(() => {
        if (!planReady) return;

        if (!registeredDomains.length) {
            setData([]);
            setTotal(0);
            return;
        }

        function normalizeDomain(d) {
            return d.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '');
        }

        const filtered = allData.filter(item => {
            const candidates = [
                (item.name || "").toLowerCase()
            ];
            if (Array.isArray(item.root_domains)) {
                candidates.push(...item.root_domains.map(normalizeDomain));
            }
            if (Array.isArray(item.domain_names)) {
                candidates.push(...item.domain_names.map(normalizeDomain));
            }
            return registeredDomains.some(domain =>
                candidates.some(c => c.includes(domain))
            );
        });

        setTotal(filtered.length);
        setData(filtered.slice((page - 1) * size, page * size));
    }, [allData, planReady, JSON.stringify(registeredDomains), page, size]);

    const handleRowDetail = (item) => {
        setModalGroupId(item.id);
        setModalOpen(true);
    };

    // --- ASSET ACTIONS ---
    async function handleExport(enumId, format = "raw") {
        setActionModal({
            open: true,
            title: "Exporting...",
            message: "Exporting asset, please wait...",
            type: "info",
            confirm: false,
        });
        try {
            const url = `https://api.projectdiscovery.io/v1/asset/enumerate/${enumId}/export?format=${format}&async=false`;
            const res = await fetch(url, {
                method: "GET",
                headers: { "X-API-Key": API_KEY }
            });
            if (!res.ok) throw new Error("Export failed");
            // Universal for all formats: download as blob
            const blob = await res.blob();
            let ext = format;
            if (format === "raw") ext = "txt";
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${enumId}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setActionModal({
                open: true,
                title: "Export Success",
                message: "Asset exported and downloaded successfully.",
                type: "success",
                confirm: false,
            });
        } catch (e) {
            setActionModal({
                open: true,
                title: "Export Failed",
                message: "Failed to export asset.",
                type: "error",
                confirm: false,
            });
        }
    }

    function confirmDeleteAsset(enumId) {
        setActionModal({
            open: true,
            title: "Delete Confirmation",
            message: "Are you sure you want to delete this asset group? This action cannot be undone.",
            type: "error",
            confirm: true,
            onConfirm: () => doDeleteAsset(enumId),
        });
    }

    async function doDeleteAsset(enumId) {
        setActionModal((m) => ({ ...m, open: false, confirm: false, onConfirm: null }));
        setIsLoading(true);
        try {
            const url = `https://api.projectdiscovery.io/v1/asset/enumerate/${enumId}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: { "X-API-Key": API_KEY }
            });
            const data = await res.json();
            setIsLoading(false);
            if (res.ok) {
                setActionModal({
                    open: true,
                    title: "Asset Deleted",
                    message: data.message || "Asset group deleted successfully.",
                    type: "success",
                    confirm: false,
                });
                fetchAssetGroups();
            } else {
                setActionModal({
                    open: true,
                    title: "Delete Failed",
                    message: data.message || "Failed to delete asset group.",
                    type: "error",
                    confirm: false,
                });
            }
        } catch (e) {
            setIsLoading(false);
            setActionModal({
                open: true,
                title: "Delete Error",
                message: "Failed to delete asset group.",
                type: "error",
                confirm: false,
            });
        }
    }

    // Loading spinner
    if (authState === "loading" || (authState === "authenticated" && !planReady)) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#161622] text-white">
                <span className="mt-8 text-lg text-gray-400 animate-pulse">Loading...</span>
            </div>
        );
    }

    // Redirect if not logged in
    if (authState === "unauthenticated") {
        if (typeof window !== "undefined") router.push("/login");
        return null;
    }

    // Jika user tidak punya domain terdaftar
    if (planReady && registeredDomains.length === 0) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#161622] text-white">
                <div className="bg-[#232339] p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">No Registered Domains</h2>
                    <p className="text-gray-300 mb-4">
                        You have not registered any domains in your plan.
                        <br />
                        Please register your domain first to view your asset groups.
                    </p>
                    <a href="/my-plan"
                       className="inline-block bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg text-white font-bold transition">
                        Go to My Plan
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#161622] to-[#232339] text-white min-h-screen">
            <section className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Asset groups</h1>
                        <p className="text-gray-400 text-base">
                            View and manage internet exposure using multiple discovery tools.
                        </p>
                    </div>
                </div>
                <div className="bg-[#18181c] rounded-2xl px-6 py-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button
                                className="p-3 rounded-lg bg-[#23232b] hover:bg-[#28283a] text-gray-400 shadow transition text-sm"
                                title="Refresh"
                                onClick={() => fetchAssetGroups()}
                            >
                                <FaSyncAlt />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-[#22222b]">
                        <AssetGroupTable
                            data={data}
                            isLoading={isLoading}
                            formatAgo={formatAgo}
                            expandedRow={expandedRow}
                            setExpandedRow={setExpandedRow}
                            onExport={handleExport}
                            onDelete={confirmDeleteAsset}
                            onRowDetail={handleRowDetail}
                        />
                    </div>
                    {/* Pagination */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 py-2 text-gray-400 text-xs">
                        <div>
                            <select
                                className="bg-[#23232b] px-2 py-1 rounded border border-gray-700 text-gray-200"
                                value={size}
                                onChange={e => {
                                    setSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {[10, 20, 50, 100].map(s => (
                                    <option key={s} value={s}>{s} per page</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button
                                className="px-3 py-1 rounded bg-[#19191d] border border-gray-700 hover:bg-[#23232b] font-semibold"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >{"<"}</button>
                            <span>
                                Showing {(page - 1) * size + 1} - {Math.min(page * size, total)} of {total || "many"}
                            </span>
                            <button
                                className="px-3 py-1 rounded bg-[#19191d] border border-gray-700 hover:bg-[#23232b] font-semibold"
                                disabled={page * size >= total}
                                onClick={() => setPage(page + 1)}
                            >{">"}</button>
                        </div>
                    </div>
                </div>
            </section>
            <AssetGroupModal open={modalOpen} onClose={() => setModalOpen(false)} groupId={modalGroupId} />
            {actionModal.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
                    <div
                        className="bg-[#1a1a22] rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] border border-pink-700 flex flex-col items-center">
                        <div className={`mb-4 text-2xl font-bold ${
                            actionModal.type === "success"
                                ? "text-green-400"
                                : actionModal.type === "error"
                                    ? "text-pink-400"
                                    : "text-blue-400"
                        }`}>
                            {actionModal.title}
                        </div>
                        <div className="mb-6 text-base text-gray-200 text-center">
                            {actionModal.message}
                        </div>
                        {actionModal.confirm ? (
                            <div className="flex gap-4 mt-4">
                                <button
                                    className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-900 transition"
                                    onClick={() => {
                                        actionModal.onConfirm && actionModal.onConfirm();
                                    }}
                                    autoFocus
                                >Yes, Delete
                                </button>
                                <button
                                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                                    onClick={() =>
                                        setActionModal((m) => ({
                                            ...m,
                                            open: false,
                                            confirm: false,
                                            onConfirm: null,
                                        }))
                                    }
                                >Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                className="mt-2 px-6 py-2 bg-pink-700 text-white font-semibold rounded-lg hover:bg-pink-800 transition"
                                onClick={() =>
                                    setActionModal((m) => ({
                                        ...m,
                                        open: false,
                                        confirm: false,
                                        onConfirm: null,
                                    }))
                                }
                                autoFocus
                            >OK</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

function AssetGroupTable({
                             data, isLoading, formatAgo,
                             expandedRow, setExpandedRow,
                             onExport, onDelete, onRowDetail
                         }) {
    return (
        <div className="relative overflow-x-auto rounded-2xl border border-[#22222b] shadow-xl bg-[#19191d]">
            <table className="min-w-full font-mono text-[15px] leading-5 bg-[#19191d] rounded-xl">
                <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#17171b] to-[#22222a] text-gray-400 border-b border-gray-700">
                    <th className={tableHeadClasses + " text-left w-2"}>
                        <input type="checkbox" className="form-checkbox h-4 w-4" disabled />
                    </th>
                    <th className={tableHeadClasses + " text-left"}>Assets</th>
                    <th className={tableHeadClasses + " text-left w-44"}>Source</th>
                    <th className={tableHeadClasses + " text-left w-44"}>Total services</th>
                    <th className={tableHeadClasses + " text-left w-32"}>Duration</th>
                    <th className={tableHeadClasses + " text-left w-32"}>Last Updated</th>
                    <th className={tableHeadClasses + " text-left w-12"}></th>
                </tr>
                </thead>
                <tbody>
                {isLoading && (
                    <tr>
                        <td colSpan={7} className="py-12 px-6 text-center text-pink-400 font-bold">
                            Loading...
                        </td>
                    </tr>
                )}
                {!isLoading && data.length === 0 && (
                    <tr>
                        <td colSpan={7} className="py-12 px-6 text-center text-gray-400">
                            <div className="flex flex-col items-center justify-center">
                                <svg className="w-12 h-12 mb-4 text-gray-600" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                          d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                </svg>
                                <p className="text-xl font-bold">No asset group data found</p>
                            </div>
                        </td>
                    </tr>
                )}
                {!isLoading && data.flatMap(item => [
                    <tr
                        key={item.id}
                        className="border-b border-gray-800 group hover:bg-gradient-to-r from-[#19191d] to-[#23232b] hover:shadow-lg transition duration-150"
                        onClick={e => {
                            if (!e.target.closest('.action-btn')) onRowDetail?.(item);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <td className="py-4 px-4">
                            <input type="checkbox" disabled className="form-checkbox h-4 w-4" />
                        </td>
                        <td className="py-4 px-4 font-mono text-base text-white flex items-center gap-3">
                                <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-tr from-green-800 to-green-500 shadow flex items-center justify-center">
                                    <FaServer className="text-green-100 text-base" />
                                </span>
                            <span className="hover:underline font-bold tracking-tight">{item.name}</span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                                <span className="bg-[#21222b] px-3 py-1 rounded text-xs font-semibold text-gray-200 border border-gray-700 flex items-center gap-2 shadow">
                                    <FaSearch className="mr-1 text-gray-400" />
                                    Auto Discovery
                                </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white flex gap-3 items-center">
                            <span>{item.total_assets || 1} services</span>
                            {item.new_assets > 0 && (
                                <span className="ml-2 px-3 py-1 rounded-full bg-green-900 text-green-400 text-xs font-bold animate-pulse">
                                        {item.new_assets} new
                                    </span>
                            )}
                        </td>
                        <td className="py-4 px-4 text-gray-200 font-mono">
                            {item.enumeration_time
                                ? item.enumeration_time.split('.')[0].replace('s', 's')
                                : "-"}
                        </td>
                        <td className="py-4 px-4 text-gray-400 font-mono">
                            {formatAgo(item.updated_at)}
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                            <button
                                className="p-2 rounded-full hover:bg-[#23232b] transition action-btn"
                                onClick={e => {
                                    e.stopPropagation();
                                    setExpandedRow(expandedRow === item.id ? null : item.id);
                                }}
                                title="Show actions"
                                tabIndex={0}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
                                     viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </button>
                        </td>
                    </tr>,
                    expandedRow === item.id && (
                        <tr key={item.id + "-expanded"}>
                            <td colSpan={7} className="p-0 bg-[#18181c] border-t border-pink-800">
                                <div className="px-6 py-4 flex flex-wrap gap-2 items-center">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-pink-900/30 border border-pink-700 text-pink-400 font-bold"
                                        title="Export Raw"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onExport(item.id, "raw");
                                            setExpandedRow(null);
                                        }}
                                    >
                                        Export Raw
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-green-900/30 border border-green-700 text-green-400 font-bold"
                                        title="Export CSV"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onExport(item.id, "csv");
                                            setExpandedRow(null);
                                        }}
                                    >
                                        Export CSV
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-blue-900/30 border border-blue-700 text-blue-400 font-bold"
                                        title="Export JSON"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onExport(item.id, "json");
                                            setExpandedRow(null);
                                        }}
                                    >
                                        Export JSON
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-red-900/30 border border-red-700 text-red-400 font-bold"
                                        title="Delete"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                            setExpandedRow(null);
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="ml-auto px-3 py-2 rounded-lg text-pink-400 text-xs"
                                        title="Close"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setExpandedRow(null);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ),
                ])}
                </tbody>
            </table>
        </div>
    );
}

export default AssetGroups;