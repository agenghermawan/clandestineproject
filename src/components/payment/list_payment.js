import React, {useState, useMemo} from "react";

function getStatusLabel(status) {
    const base =
        "px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm";
    switch (status) {
        case 0:
            return (
                <span className={`${base} text-yellow-300 border-yellow-600/40 bg-yellow-900/30`}>
          Pending
        </span>
            );
        case 1:
            return (
                <span className={`${base} text-green-300 border-green-600/40 bg-green-900/30`}>
          Paid
        </span>
            );
        case 2:
            return (
                <span className={`${base} text-red-300 border-red-600/40 bg-red-900/30`}>
          Expired
        </span>
            );
        default:
            return (
                <span className={`${base} text-gray-300 border-gray-600/40 bg-gray-800/30`}>
          Unknown
        </span>
            );
    }
}

function formatCrypto(amount, asset) {
    if (amount == null || isNaN(amount)) return "-";

    const isStable = ["USDT", "USDC", "DAI"].includes(asset?.toUpperCase());
    const decimals = isStable ? 2 : 8; // 2 untuk stablecoin, 8 untuk crypto lain

    const formatted = parseFloat(amount)
        .toFixed(decimals)
        .replace(/\.?0+$/, ""); // hapus nol di belakang

    return `${formatted} ${asset || ""}`.trim();
}


export default function PaymentsTable({payments, onAction}) {
    const LIMIT = 5;
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const filteredPayments = useMemo(() => {
        if (!search.trim()) return payments;
        const s = search.trim().toLowerCase();
        return payments.filter((p) =>
            [p.invoice?.Id, p.payment?.Id, p.domain, p.plan, p.payment?.AssetCode, p.payment?.BlockchainCode]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(s))
        );
    }, [payments, search]);

    const totalPage = Math.max(1, Math.ceil(filteredPayments.length / LIMIT));
    const paginatedPayments = filteredPayments.slice((page - 1) * LIMIT, page * LIMIT);

    React.useEffect(() => setPage(1), [search]);

    if (!payments || payments.length === 0) {
        return (
            <div className="text-center text-gray-400 py-20">
                <svg
                    className="mx-auto w-16 h-16 mb-6 opacity-70"
                    viewBox="0 0 64 64"
                    fill="none"
                >
                    <ellipse cx="32" cy="36" rx="18" ry="14" fill="#232339"/>
                    <ellipse
                        cx="32"
                        cy="32"
                        rx="22"
                        ry="18"
                        stroke="#f03262"
                        strokeWidth="2"
                    />
                    <circle cx="32" cy="44" r="2.5" fill="#f03262"/>
                </svg>
                <h2 className="text-xl font-bold text-white mb-2">
                    No Payments Found
                </h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                    You haven't made any payments yet.<br/>
                    Purchase a subscription plan to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <input
                    className="w-full md:w-1/3 bg-[#0f0f14]/60 border border-[#2b2b35] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#f03262]/80 focus:border-transparent transition backdrop-blur-md"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Search invoice, payment ID, domain, etc..."
                />
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={`px-3 py-1 rounded-lg bg-[#18181f] text-gray-200 border border-[#2b2b35] font-semibold text-sm transition ${
                            page === 1
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-[#232339] hover:text-pink-400"
                        }`}
                    >
                        ⬅ Prev
                    </button>
                    <span className="text-pink-400 font-semibold text-sm">
            Page {page} / {totalPage}
          </span>
                    <button
                        disabled={page === totalPage}
                        onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                        className={`px-3 py-1 rounded-lg bg-[#18181f] text-gray-200 border border-[#2b2b35] font-semibold text-sm transition ${
                            page === totalPage
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-[#232339] hover:text-pink-400"
                        }`}
                    >
                        Next ➡
                    </button>
                </div>
            </div>

            {/* Table */}
            <div
                className="overflow-x-auto rounded-2xl border border-[#23232c] shadow-lg shadow-black/40 bg-[#13131a]/60 backdrop-blur-md">
                <table className="min-w-full text-sm font-mono text-gray-200">
                    <thead>
                    <tr className="bg-gradient-to-r from-[#181825] to-[#23232c] text-pink-400 text-xs uppercase tracking-wider">
                        {[
                            "No",
                            "Invoice",
                            "Payment ID",
                            "Domain",
                            "Plan",
                            "Amount",
                            "Asset",
                            "Blockchain",
                            "Status",
                            "Action"
                        ].map((h) => (
                            <th key={h} className="py-3 px-3 text-center">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedPayments.map((payment, idx) => (
                        <tr
                            key={payment.invoice?.Id || idx}
                            className="group transition-all duration-200 hover:bg-gradient-to-r from-[#1f1f2c] to-[#f03262]/10 hover:shadow-[0_0_10px_#f03262]/20"
                        >
                            <td className="py-3 px-3 text-pink-400 font-semibold">
                                {(page - 1) * LIMIT + idx + 1}
                            </td>
                            <td className="py-3 px-3">{payment.invoice?.Id || "-"}</td>
                            <td className="py-3 px-3 text-green-400 font-mono">
                                {payment.payment?.Id || "-"}
                            </td>
                            <td className="py-3 px-3">{payment.domain || "-"}</td>
                            <td className="py-3 px-3 capitalize">{payment.plan || "-"}</td>
                            <td className="py-3 px-3">
                                {formatCrypto(payment.payment?.Amount,)}
                            </td>
                            <td className="py-3 px-3">
                                {payment.payment?.AssetCode}
                            </td>
                            <td className="py-3 px-3">
                                {payment.payment?.BlockchainCode || "-"}
                            </td>
                            <td className="py-3 px-3">
                                {getStatusLabel(payment.payment?.Status)}
                            </td>
                            <td className="py-3 px-3 text-right">
                                <button
                                    onClick={() => onAction && onAction(payment)}
                                    className="bg-gradient-to-r from-[#f03262] to-[#732459] hover:from-[#c91d4e] hover:to-[#3a1f40] px-4 py-2 rounded-lg text-xs font-bold text-white transition-all duration-150 shadow-md shadow-pink-800/30 group-hover:scale-[1.03]"
                                >
                                    {payment.payment?.Id ? "Check Payment" : "Pay Now"}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Info total */}
            <div className="text-xs text-gray-400 text-right">
                Showing {(page - 1) * LIMIT + 1} -{" "}
                {Math.min(page * LIMIT, filteredPayments.length)} of{" "}
                {filteredPayments.length} payments
            </div>
        </div>
    );
}
