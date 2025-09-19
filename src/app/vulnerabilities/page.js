"use client";
import { useState, useRef, useEffect } from "react";
import {
    MdAdd,
    MdRefresh,
    MdLayers,
    MdAccessTime,
    MdCheckCircle,
    MdError,
    MdReplay,
    MdStop,
    MdDelete,
    MdDownload,
    MdMoreVert
} from "react-icons/md";
import ScanDomainModal from "../../components/va/va_scan_domain_modal";
import VAScannerLoader from "../../components/va/va_scanner_loader";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import VAParticles from "../../components/va/va_particles";
import VAScanPollingBar from "../../components/va/va_scan_polling_bar"

const severityColors = {
    critical: "bg-red-700 text-red-100 border-red-400",
    high: "bg-orange-600 text-orange-50 border-orange-400",
    medium: "bg-yellow-500 text-yellow-50 border-yellow-400",
    low: "bg-green-700 text-green-100 border-green-400",
    info: "bg-blue-900 text-blue-100 border-blue-400",
    unknown: "bg-gray-800 text-gray-100 border-gray-400",
};

function formatAgo(date) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

function formatDuration(str) {
    if (!str) return "-";
    const match = str.match(/((\d+)h)?((\d+)m)?((\d+(\.\d+)?)s)?/);
    if (!match) return str;
    let res = "";
    if (match[2]) res += `${match[2]}h `;
    if (match[4]) res += `${match[4]}m `;
    if (match[6]) res += `${parseFloat(match[6]).toFixed(0)}s`;
    return res.trim() || str;
}

function StatusBadge({ status }) {
    let color = "bg-gray-700 text-gray-300";
    let icon = <MdAccessTime className="inline mr-1 -mt-1" />;
    if (status === "finished" || status === "completed") {
        color = "bg-green-800 text-green-200";
        icon = <MdCheckCircle className="inline mr-1 -mt-1" />;
    } else if (status === "failed") {
        color = "bg-red-700 text-red-200";
        icon = <MdError className="inline mr-1 -mt-1" />;
    } else if (
        status === "running" ||
        status === "starting" ||
        status === "queued"
    ) {
        color = "bg-blue-700 text-blue-100 animate-pulse";
    }
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}
        >
      {icon}
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
    );
}

function SeverityBreakdown({ severity }) {
    const order = ["critical", "high", "medium", "low", "info", "unknown"];
    const total = Object.keys(severity || {}).length
        ? Object.values(severity).reduce((a, b) => a + parseInt(b), 0)
        : 0;
    if (!total) {
        return (
            <span className="bg-gray-800 text-gray-400 px-4 py-1 rounded-full text-xs">
        NO VULNERABILITIES FOUND
      </span>
        );
    }
    return (
        <div className="flex flex-nowrap gap-2">
            {order.map(
                (key) =>
                    severity?.[key] > 0 && (
                        <span
                            key={key}
                            className={`border ${severityColors[key]} px-2 py-1 rounded-full text-xs font-bold`}
                        >
              {key.charAt(0).toUpperCase() + key.slice(1)}: {severity[key]}
            </span>
                    )
            )}
        </div>
    );
}

function Teaser() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
            <div className="rounded-2xl bg-gradient-to-br from-[#232339] via-[#232339] to-[#18181c] px-8 py-14 flex flex-col items-center border border-pink-700/30 shadow-2xl max-w-lg">
                <div className="mb-6 flex flex-col items-center">
                    <MdLayers className="text-pink-500 text-5xl mb-2" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-1">
                        Unlock Vulnerability Assessment
                    </h2>
                    <p className="text-gray-300 text-center mb-2">
                        Sign in and activate your subscription plan to access scan history,
                        run new vulnerability scans, and protect your assets.
                    </p>
                    <div className="text-pink-400 font-bold text-base mt-2">
            <span className="bg-pink-900/30 px-3 py-1 rounded-lg">
              Start your security journey now!
            </span>
                    </div>
                </div>
                <a
                    href="/pricing"
                    className="mt-6 bg-pink-700 hover:bg-pink-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow transition-all"
                >
                    See Plans & Pricing
                </a>
            </div>
        </div>
    );
}

export default function Page() {
    const { authState } = useAuth();

    // Data & Pagination
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [userDomains, setUserDomains] = useState([]);
    const [domainLimit, setDomainLimit] = useState(null);

    // Plan fetch & state
    const [plan, setPlan] = useState(null);
    const [planLoaded, setPlanLoaded] = useState(false);

    // Pagination & search
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [pageInput, setPageInput] = useState(1);
    const [sizeInput, setSizeInput] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState({ dir: "desc", field: "created_at" });

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState("");

    // Scan polling
    const [pollScanId, setPollScanId] = useState(null);
    const [pollScanStatus, setPollScanStatus] = useState(null);
    const [lastScanStatus, setLastScanStatus] = useState(null);
    const [polling, setPolling] = useState(false);
    const pollingRef = useRef();

    // Refresh
    const [refreshKey, setRefreshKey] = useState(0);

    // Loader (untuk modal/scan dan action)
    const [downloadStep, setDownloadStep] = useState("");
    const [scanStep, setScanStep] = useState("");
    const [searchValue, setSearchValue] = useState("");

    // Expandable row state
    const [expandedRow, setExpandedRow] = useState(null);
    const [isStopping, setIsStopping] = useState(false);
    const [actionModal, setActionModal] = useState({
        open: false,
        title: "",
        message: "",
        type: "success",
        confirm: false,
        onConfirm: null,
    });

    const router = useRouter();

    // Plan and allowed domains fetch
    useEffect(() => {
        if (authState !== "authenticated") {
            setPlanLoaded(true);
            return;
        }
        fetch("/api/my-plan", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setPlan(data.data);
                setPlanLoaded(true);
                const domains = Array.isArray(data.data?.registered_domain)
                    ? data.data.registered_domain
                    : [];
                const dLimit = data.data?.domain;
                setDomainLimit(dLimit);
                if (dLimit === "unlimited") {
                    setUserDomains(null);
                } else {
                    setUserDomains(domains);
                }
            })
            .catch(() => {
                setPlanLoaded(true);
                setPlan(null);
            });
    }, [authState]);

    useEffect(() => {
        if (authState !== "authenticated" || !planLoaded) return;
        if (!plan || (plan.expired && new Date(plan.expired) < new Date())) {
            setScans([]);
            setTotal(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError("");
        const params = new URLSearchParams({
            page,
            size,
            search,
            status,
        });
        if (sort.field) {
            params.append(sort.dir === "asc" ? "sort_asc" : "sort_desc", sort.field);
        }

        // Helper: Extract domain from scan.name ("Scan for https://domain.com/ ~ ...")
        function extractDomainFromScanName(scanName) {
            const match = scanName.match(/Scan for\s+([^\s~]+)/i);
            if (match && match[1]) {
                return match[1].replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase();
            }
            return scanName.replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        }

        fetch(`/api/va-scan-list?${params.toString()}`)
            .then((r) => r.json())
            .then((data) => {
                let scanArr = Array.isArray(data.scans) ? data.scans : [];

                // --- 1. Filter by domain langsung saat load ---
                const isUnlimited = domainLimit === "unlimited";
                let domainList = [];
                if (isUnlimited) {
                    domainList = Array.isArray(plan.registered_breach_domain)
                        ? plan.registered_breach_domain.map(d =>
                            d.replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase()
                        )
                        : [];
                } else if (Array.isArray(userDomains) && userDomains.length > 0) {
                    domainList = userDomains.map(d => d.toLowerCase());
                }

                if (domainList.length > 0) {
                    scanArr = scanArr.filter(scan => {
                        const scanDomain = extractDomainFromScanName(scan.name || "");
                        return domainList.some(domain => scanDomain === domain);
                    });
                }

                if (search) {
                    const searchLower = search.toLowerCase();
                    scanArr = scanArr.filter(scan =>
                        scan.name && scan.name.toLowerCase().includes(searchLower)
                    );
                }

                setScans(scanArr);
                setTotal(scanArr.length);
                setPageInput(page);
                setSizeInput(size);
                setLoading(false);
            })
            .catch(() => {
                setFetchError("Failed to fetch scan history");
                setLoading(false);
            });
    }, [
        authState,
        plan,
        planLoaded,
        page,
        size,
        search,      // gunakan ini untuk scan name filter (opsional)
        status,
        sort,
        refreshKey,
        domainLimit,
        userDomains,
    ]);

    async function handleScan(domain) {
        setScanLoading(true);
        setScanError("");
        setSearchValue(domain);
        setDownloadStep("Downloading templates...");
        try {
            await new Promise((r) => setTimeout(r, 800));
            setDownloadStep("");
            setScanStep("Submitting scan...");

            if (plan?.domain === "unlimited") {
                // Ambil semua domain lama dari plan (format sesuai backend, misal https://domain.com/)
                const breachDomainsRaw = Array.isArray(plan.registered_breach_domain)
                    ? plan.registered_breach_domain
                    : [];

                const normalizedScanDomain = domain.trim().replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase();
                const breachDomainsNormalized = breachDomainsRaw.map(d =>
                    d.replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase()
                );

                const alreadyStored = breachDomainsNormalized.includes(normalizedScanDomain);

                let selectedDomains = breachDomainsRaw;
                if (!alreadyStored) {
                    selectedDomains = [...breachDomainsRaw, `https://${normalizedScanDomain}/`];
                }
                selectedDomains = Array.from(new Set(selectedDomains));

                await fetch("/api/register-breach-domain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        selected_domains: selectedDomains
                    }),
                });
            }

            const res = await fetch("/api/va-scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: domain.trim() }),
            });

            setScanStep("");
            const data = await res.json();

            if (!res.ok || data.error) {
                setScanError(data.error || "Failed to start scan");
                setScanLoading(false);
                return;
            }

            setModalOpen(false);
            setScanLoading(false);
            setPollScanId(data.scan_id);
            setPollScanStatus(data.status || "starting");
            setLastScanStatus(data.status || "starting");
            setPolling(true);

            setScans((prev) => [
                {
                    scan_id: data.scan_id,
                    name: domain,
                    status: data.status || "starting",
                    progress: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                ...prev,
            ]);
        } catch (e) {
            setScanError("Failed to start scan");
            setDownloadStep("");
            setScanStep("");
            setScanLoading(false);
        }
    }

    async function handleRescan(scan) {
        setScanLoading(true);
        try {
            const res = await fetch(`/api/va-scan-rescan?scan_id=${scan.scan_id}`, {
                method: "POST"
            });
            const data = await res.json();
            setScanLoading(false);
            if (res.ok && data.id) {
                setActionModal({
                    open: true,
                    title: "Rescan Success",
                    message: data.message || "Rescan started successfully.",
                    type: "success",
                    confirm: false,
                });
                setRefreshKey((k) => k + 1);
            } else {
                setActionModal({
                    open: true,
                    title: "Rescan Failed",
                    message: data.message || "Failed to rescan.",
                    type: "error",
                    confirm: false,
                });
            }
        } catch (e) {
            setScanLoading(false);
            setActionModal({
                open: true,
                title: "Rescan Error",
                message: "Failed to rescan.",
                type: "error",
                confirm: false,
            });
        }
    }

    async function handleStopScan(scan_id) {
        setScanLoading(true);
        setIsStopping(true); // <-- set state
        try {
            const res = await fetch(`/api/va-scan-stop?scan_id=${scan_id}`, {
                method: "POST",
            });
            const data = await res.json();
            setScanLoading(false);
            setIsStopping(false); // <-- reset state
            setPolling(false); // <-- hide polling bar!
            if (res.ok && data.ok) {
                setActionModal({
                    open: true,
                    title: "Scan Stopped",
                    message: data.message || "Scan has been stopped.",
                    type: "success",
                    confirm: false,
                });
                setRefreshKey((k) => k + 1);
            } else {
                setActionModal({
                    open: true,
                    title: "Stop Failed",
                    message: data.message || "Failed to stop scan.",
                    type: "error",
                    confirm: false,
                });
            }
        } catch (e) {
            setScanLoading(false);
            setIsStopping(false); // <-- reset state
            setPolling(false); // <-- hide polling bar!
            setActionModal({
                open: true,
                title: "Stop Error",
                message: "Failed to stop scan.",
                type: "error",
                confirm: false,
            });
        }
    }

    async function handleExport(scan_id, scan_name, type = "csv") {
        setScanLoading(true);
        try {
            const res = await fetch(`/api/va-scan-export?scan_id=${scan_id}&type=${type}`);
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            let ext = type;
            if (type === "csv") ext = "csv";
            if (type === "json") ext = "json";
            if (type === "pdf") ext = "pdf";
            if (type === "raw") ext = "txt";
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${scan_name || scan_id}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setActionModal({
                open: true,
                title: "Export Success",
                message: `${type.toUpperCase()} exported successfully.`,
                type: "success",
                confirm: false,
            });
        } catch (e) {
            setActionModal({
                open: true,
                title: "Export Failed",
                message: `Failed to export ${type.toUpperCase()}.`,
                type: "error",
                confirm: false,
            });
        }
        setScanLoading(false);
    }

    function confirmDeleteScan(scan_id, status, name) {
        setActionModal({
            open: true,
            title: "Delete Confirmation",
            message: "Are you sure you want to delete this scan? This action cannot be undone.",
            type: "error",
            confirm: true,
            onConfirm: () => doDeleteScan(scan_id),
        });
    }

    async function doDeleteScan(scan_id) {
        setActionModal((m) => ({ ...m, open: false, confirm: false, onConfirm: null }));
        setScanLoading(true);
        try {
            const res = await fetch(`/api/va-scan-delete?scan_id=${scan_id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            setScanLoading(false);
            if (res.ok && data.ok) {
                setActionModal({
                    open: true,
                    title: "Scan Deleted",
                    message: data.message || "Scan has been deleted.",
                    type: "success",
                    confirm: false,
                });
                setRefreshKey((k) => k + 1);
            } else {
                setActionModal({
                    open: true,
                    title: "Delete Failed",
                    message: data.message || "Failed to delete scan.",
                    type: "error",
                    confirm: false,
                });
            }
        } catch (e) {
            setScanLoading(false);
            setActionModal({
                open: true,
                title: "Delete Error",
                message: "Failed to delete scan.",
                type: "error",
                confirm: false,
            });
        }
    }

    // Scan polling effect: update status FE list
    useEffect(() => {
        if (!pollScanId || !polling) return;

        pollingRef.current = setInterval(async () => {
            const res = await fetch(`/api/va-scan-status?scan_id=${pollScanId}`);
            const data = await res.json();

            let status = data.status;
            if (!status) status = lastScanStatus || "starting";
            setPollScanStatus(status);
            setLastScanStatus(status);

            setScans((prev) =>
                prev.map((scan) =>
                    scan.scan_id === pollScanId
                        ? {
                            ...scan,
                            status: status,
                            progress: status === "finished" ? 100 : scan.progress ?? 0,
                            updated_at: new Date().toISOString(),
                        }
                        : scan
                )
            );

            if (["finished", "failed", "completed"].includes(status)) {
                setPolling(false);
                clearInterval(pollingRef.current);

                setTimeout(() => setRefreshKey((k) => k + 1), 1500);
            }
        }, 15000);

        return () => clearInterval(pollingRef.current);
    }, [pollScanId, polling, lastScanStatus]);

    // Pagination logic
    const maxPage = Math.max(1, Math.ceil(total / size));
    const handlePagination = (direction) => {
        let newPage = page;
        if (direction === "prev" && newPage > 1) newPage--;
        else if (direction === "next" && newPage < maxPage) newPage++;
        setPage(newPage);
    };
    const handlePageInputChange = (e) => setPageInput(e.target.value);
    const handlePageInputBlur = () => {
        let value = parseInt(pageInput, 10);
        if (isNaN(value) || value < 1) value = 1;
        if (value > maxPage) value = maxPage;
        setPageInput(value);
        setPage(value);
    };
    const handleSizeInputChange = (e) => setSizeInput(e.target.value);
    const handleSizeInputBlur = () => {
        let value = parseInt(sizeInput, 10);
        if (isNaN(value) || value < 1) value = 10;
        if (value > 100) value = 100;
        setSizeInput(value);
        setSize(value);
        setPage(1);
        setPageInput(1);
    };

    const showTeaser =
        authState !== "authenticated" ||
        (planLoaded &&
            (!plan || (plan.expired && new Date(plan.expired) < new Date())));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#18181c] via-[#161622] to-[#18181c] text-white flex flex-col font-inter relative">
            <VAParticles />
            {showTeaser ? (
                <Teaser />
            ) : (
                <>
                    {(scanLoading || downloadStep || scanStep) && (
                        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
                            <VAScannerLoader
                                status={downloadStep || scanStep || "Processing..."}
                                domain={searchValue}
                            />
                        </div>
                    )}
                    {polling &&
                        !["finished", "failed", "completed", "stopping"].includes(pollScanStatus) &&
                        !isStopping && (
                            <VAScanPollingBar
                                scanId={pollScanId}
                                scanName={searchValue}
                                status={pollScanStatus}
                                progress={scans.find(s => s.scan_id === pollScanId)?.progress ?? 0}
                                startedAt={scans.find(s => s.scan_id === pollScanId)?.created_at}
                                estimatedDuration="~2-5 min"
                                onStop={() => handleStopScan(pollScanId)}
                                isStopping={isStopping}
                            />
                        )
                    }

                    <div className="flex items-center py-6 px-8 justify-between border-b border-[#232339] bg-[#161622]/80 backdrop-blur">
                        <div className="flex gap-3 items-center w-full max-w-2xl">
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="🔎 Search scan by name"
                                className="px-4 py-2 rounded-lg bg-[#161623] border border-[#232339] text-white placeholder-gray-500 flex-1 shadow"
                            />
                            <button
                                className="ml-2 px-3 py-2 bg-[#232339] hover:bg-[#1e1e24] rounded text-white shadow"
                                onClick={() => setRefreshKey((k) => k + 1)}
                                title="Refresh"
                            >
                                <MdRefresh size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="bg-white text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-pink-600 hover:text-white transition"
                                onClick={() => {
                                    setExpandedRow(null);
                                    router.push("vulnerabilities/assets");
                                }}
                            >
                                <MdLayers size={22} />
                                Assets
                            </button>
                            <button
                                className="bg-white text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-pink-600 hover:text-white transition"
                                onClick={() => setModalOpen(true)}
                            >
                                <MdAdd size={22} />
                                Create New Scan
                            </button>
                        </div>
                    </div>

                    <ScanDomainModal
                        open={modalOpen}
                        onClose={() => {
                            setModalOpen(false);
                            setScanError("");
                        }}
                        onSubmit={handleScan}
                        allowedDomains={userDomains}
                        loading={scanLoading}
                        error={scanError}
                        isUnlimited={plan?.domain === "unlimited"}
                    />

                    <div className="flex-1 px-8 py-6 mt-8">
                        <div className="w-full mx-auto">
                            <div className="mb-7 flex flex-col items-center">
                <span className="uppercase tracking-widest text-pink-400 font-bold text-xs mb-2">
                  Vulnerability Assessment History
                </span>
                                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                                    Scan Results Overview
                                </h2>
                                <p className="text-gray-400 text-center max-w-xl">
                                    Below is the history of your vulnerability scans.&nbsp;
                                    <span className="text-pink-400 font-semibold">Monitor</span>{" "}
                                    progress,&nbsp;
                                    <span className="text-pink-400 font-semibold">review</span>{" "}
                                    findings, and&nbsp;
                                    <span className="text-pink-400 font-semibold">manage</span>{" "}
                                    your assets security in real-time.
                                </p>
                            </div>
                            {!loading && fetchError ? (
                                <div className="text-pink-400 p-6">{fetchError}</div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto rounded-xl border border-[#232339] shadow-lg bg-[#161622]">
                                        <table className="min-w-full text-white font-mono">
                                            <thead>
                                            <tr className="border-b border-[#232339] bg-[#191924]/90 text-xs text-gray-400 sticky top-0 z-10 backdrop-blur">
                                                <th className="py-4 px-5 font-semibold text-left cursor-pointer select-none transition-colors hover:text-pink-400">
                                                    Scan Name{" "}
                                                    {sort.field === "name" &&
                                                        (sort.dir === "asc" ? "↑" : "↓")}
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Status
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Severity Breakdown
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Templates
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Services
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Progress
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Duration
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Last Updated
                                                </th>
                                                <th className="py-4 px-5 font-semibold text-left">
                                                    Action
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="py-10 text-center text-gray-400 text-base"
                                                    >
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : scans.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="py-10 text-center text-gray-400 text-base"
                                                    >
                                                        No scan found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                scans.flatMap((scan) => [
                                                    <tr
                                                        key={scan.scan_id || scan.id}
                                                        onClick={() =>
                                                            router.push(
                                                                `/vulnerabilities/${scan.scan_id || scan.id}`
                                                            )
                                                        }
                                                        className="border-b cursor-pointer border-[#232339] hover:bg-[#232339]/80 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg hover:shadow-pink-700/20 odd:bg-[#18181c] even:bg-[#1c1c28]"
                                                    >
                                                        <td className="py-4 px-5 font-bold whitespace-nowrap max-w-xs truncate group-hover:underline">
                                <span title={scan.name}>
                                  {scan.name?.length > 32
                                      ? scan.name.slice(0, 32) + "..."
                                      : scan.name}
                                </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="animate-fadeIn">
                                                                <StatusBadge status={scan.status} />
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="animate-fadeIn">
                                                                <SeverityBreakdown severity={scan.severity} />
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                <span className="bg-black/40 border border-pink-700 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
                                  {scan.total_template?.toLocaleString() || "-"}
                                </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                <span className="bg-black/40 border border-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
                                  {scan.total_target?.toLocaleString() || "-"}
                                </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="w-28 bg-gray-800 rounded-full h-4 overflow-hidden flex items-center relative">
                                                                <div
                                                                    className={`h-full rounded-l-full transition-all duration-700 ease-out ${
                                                                        scan.progress === 100
                                                                            ? "bg-green-600"
                                                                            : "bg-pink-500 animate-pulse"
                                                                    }`}
                                                                    style={{ width: `${scan.progress}%` }}
                                                                ></div>
                                                                <span className="absolute text-xs font-bold w-full text-center">
                                    {scan.progress || 0}%
                                  </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            {formatDuration(scan.scan_time_elapsed)}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            {formatAgo(scan.updated_at)}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <button
                                                                className="p-2 rounded-full hover:bg-[#232339] transition"
                                                                title="Show actions"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setExpandedRow(
                                                                        expandedRow === scan.scan_id
                                                                            ? null
                                                                            : scan.scan_id
                                                                    );
                                                                }}
                                                            >
                                                                <MdMoreVert size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>,
                                                    expandedRow === scan.scan_id && (
                                                        <tr key={scan.scan_id + "-expanded"}>
                                                            <td colSpan={9} className="p-0 bg-[#191924] border-t border-pink-800">
                                                                <div className="px-6 py-4 flex flex-wrap gap-2 items-center">
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-[#232339] text-blue-400 font-bold"
                                                                        title="Rescan"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setExpandedRow(null);
                                                                            handleRescan(scan);
                                                                        }}
                                                                    >
                                                                        <MdReplay size={18} className="text-blue-400" />
                                                                        <span className="hidden md:inline">Rescan</span>
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-[#232339] text-green-400 font-bold"
                                                                        title="Export CSV"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setExpandedRow(null);
                                                                            handleExport(scan.scan_id, scan.name, "csv");
                                                                        }}
                                                                    >
                                                                        <MdDownload size={18} className="text-green-400" />
                                                                        <span className="hidden md:inline">Export CSV</span>
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-[#232339] text-blue-400 font-bold"
                                                                        title="Export JSON"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setExpandedRow(null);
                                                                            handleExport(scan.scan_id, scan.name, "json");
                                                                        }}
                                                                    >
                                                                        <MdDownload size={18} className="text-blue-400" />
                                                                        <span className="hidden md:inline">Export JSON</span>
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-[#232339] text-red-400 font-bold"
                                                                        title="Export PDF"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setExpandedRow(null);
                                                                            handleExport(scan.scan_id, scan.name, "pdf");
                                                                        }}
                                                                    >
                                                                        <MdDownload size={18} className="text-red-400" />
                                                                        <span className="hidden md:inline">Export PDF</span>
                                                                    </button>

                                                                    <button
                                                                        className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg font-bold ${
                                                                            ["running", "starting", "queued"].includes(scan.status)
                                                                                ? "hover:bg-[#232339] text-yellow-400"
                                                                                : "text-gray-500 cursor-not-allowed"
                                                                        }`}
                                                                        title="Stop"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            if (
                                                                                ["running", "starting", "queued"].includes(scan.status)
                                                                            ) {
                                                                                setExpandedRow(null);
                                                                                handleStopScan(scan.scan_id);
                                                                            }
                                                                        }}
                                                                        disabled={!["running", "starting", "queued"].includes(scan.status)}
                                                                    >
                                                                        <MdStop size={18} />
                                                                        <span className="hidden md:inline">Stop</span>
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-[#232339] text-red-400 font-bold"
                                                                        title="Delete"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setExpandedRow(null);
                                                                            confirmDeleteScan(scan.scan_id, scan.status, scan.name);
                                                                        }}
                                                                    >
                                                                        <MdDelete size={18} className="text-red-400" />
                                                                        <span className="hidden md:inline">Delete</span>
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
                                                ])
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-500 text-sm">
                                                Showing {scans.length} of {total} entries (Page {page} / {maxPage})
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                onClick={() => handlePagination("prev")}
                                                disabled={page === 1}
                                                className={`px-4 py-2 text-sm ${
                                                    page === 1
                                                        ? "bg-gray-800 cursor-not-allowed"
                                                        : "bg-gray-800 hover:bg-gray-700"
                                                } rounded-lg transition-colors`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePagination("next")}
                                                disabled={page >= maxPage}
                                                className={`px-4 py-2 text-sm ${
                                                    page >= maxPage
                                                        ? "bg-pink-700/50 cursor-not-allowed"
                                                        : "bg-pink-700 hover:bg-pink-600"
                                                } rounded-lg transition-colors`}
                                            >
                                                Next
                                            </button>
                                            <label className="ml-2 text-sm text-gray-300">
                                                Limit/Per Page:
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={sizeInput}
                                                onChange={handleSizeInputChange}
                                                onBlur={handleSizeInputBlur}
                                                className="w-20 px-2 py-2 rounded-md border border-gray-700 bg-black/30 text-white text-center focus:ring-2 focus:ring-[#f03262] focus:border-transparent"
                                                title="Entries per page (max 100)"
                                            />
                                            <label className="ml-2 text-sm text-gray-300">
                                                Page:
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={maxPage}
                                                value={pageInput}
                                                onChange={handlePageInputChange}
                                                onBlur={handlePageInputBlur}
                                                className="w-16 px-2 py-2 rounded-md border border-gray-700 bg-black/30 text-white text-center focus:ring-2 focus:ring-[#f03262] focus:border-transparent"
                                                title="Go to page"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {actionModal.open && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
                            <div className="bg-[#1a1a22] rounded-2xl shadow-xl p-8 min-w-[320px] max-w-[90vw] border border-pink-700 flex flex-col items-center">
                                <div className={`mb-4 text-2xl font-bold ${
                                    actionModal.type === "success"
                                        ? "text-green-400"
                                        : "text-pink-400"
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
                </>
            )}
        </div>
    );
}