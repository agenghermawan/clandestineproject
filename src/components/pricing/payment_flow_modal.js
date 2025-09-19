import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

// Simple Spinner (no neon)
function SimpleSpinner({ size = 44, color = "#e5e7eb" }) {
    return (
        <svg className="animate-spin" width={size} height={size} viewBox="0 0 50 50">
            <circle
                cx="25" cy="25" r="20"
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeDasharray="90"
                strokeDashoffset="30"
                strokeLinecap="round"
                opacity="0.5"
            />
        </svg>
    );
}

// Header SVG (subtle, no neon)
function ModalPaySVG() {
    return (
        <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 64 64">
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#232339" />
            <ellipse cx="32" cy="32" rx="22" ry="18" stroke="#c7d2fe" strokeWidth="2" fill="none" />
            <path d="M32 20v10" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="44" r="3" fill="#a1a1aa" />
            <rect x="24" y="26" width="16" height="6" rx="3" fill="#18181c" stroke="#a1a1aa" strokeWidth="1" />
        </svg>
    );
}

// Helper: Format crypto amount
function formatAmount(amount, decimals = 6) {
    if (!amount) return "-";
    const str = amount.toString().padStart(decimals + 1, "0");
    const intPart = str.slice(0, -decimals);
    let fracPart = str.slice(-decimals);
    fracPart = fracPart.replace(/0+$/, "");
    return fracPart.length ? `${intPart}.${fracPart}` : intPart;
}

export default function PaymentFlowModal({
                                             show,
                                             onClose,
                                             invoiceId,
                                             idPricing,
                                             plan,
                                             paymentData: propPaymentData,
                                             forceRegisterDomain = false,
                                             domainLimit = 1,
                                         }) {
    // --- STATE ---
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [assetsError, setAssetsError] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedBlockchain, setSelectedBlockchain] = useState(null);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [paymentData, setPaymentData] = useState(propPaymentData || null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(
        propPaymentData && propPaymentData.Status !== undefined
            ? { Status: propPaymentData.Status }
            : null
    );
    const [statusError, setStatusError] = useState(null);
    const [notPaidError, setNotPaidError] = useState(false);
    const [domains, setDomains] = useState([""]);
    const [registering, setRegistering] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState("");
    const [registerError, setRegisterError] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    // --- EFFECTS ---
    useEffect(() => {
        if (!show || propPaymentData || !invoiceId || !idPricing || !plan) return;
        setLoadingAssets(true);
        setAssetsError(null);
        setSelectedAsset(null);
        setSelectedBlockchain(null);
        setPaymentData(null);
        setPaymentStatus(null);
        setStatusError(null);
        setDomains([""]);
        setRegisterError(null);
        setRegisterSuccess("");
        setNotPaidError(false);
        setShowRegisterForm(false);
        fetch("/api/asset-list", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idPricing, plan }),
        })
            .then(res => res.json())
            .then(data => setAssets(Array.isArray(data.data) ? data.data : []))
            .catch(() => setAssetsError("Failed to load asset list."))
            .finally(() => setLoadingAssets(false));
    }, [show, invoiceId, idPricing, plan, propPaymentData]);

    useEffect(() => {
        setSelectedAsset(null);
        setSelectedBlockchain(null);
        setCreateError(null);
        setPaymentData(propPaymentData || null);
        setPaymentStatus(
            propPaymentData && propPaymentData.Status !== undefined
                ? { Status: propPaymentData.Status }
                : null
        );
        setStatusError(null);
        setDomains([""]);
        setRegisterError(null);
        setRegisterSuccess("");
        setNotPaidError(false);
        setShowRegisterForm(false);
    }, [show, assets.length, propPaymentData]);

    useEffect(() => {
        if (forceRegisterDomain) {
            setShowRegisterForm(true);
        } else if (
            (paymentStatus && paymentStatus.Status === 100) ||
            (propPaymentData && propPaymentData.Status === 100)
        ) {
            setShowRegisterForm(true);
        } else {
            setShowRegisterForm(false);
        }
    }, [forceRegisterDomain, paymentStatus, propPaymentData]);

    // --- HANDLERS ---
    const handleCreatePayment = async () => {
        if (!selectedAsset || !selectedBlockchain) return;
        setCreatingPayment(true);
        setCreateError(null);
        try {
            const res = await fetch("/api/create-payment", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceId,
                    assetCode: selectedAsset.Code,
                    blockchainCode: selectedBlockchain.Code,
                    isEvm: selectedBlockchain.IsEvm !== undefined ? selectedBlockchain.IsEvm : true,
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to create payment");
            setPaymentData(result.data);
        } catch (e) {
            setCreateError(e.message || "Failed to create payment.");
        } finally {
            setCreatingPayment(false);
        }
    };

    const decimals =
        selectedBlockchain?.Decimals ||
        selectedAsset?.Decimals ||
        paymentData?.Decimals ||
        6;

    const handleCheckPayment = async () => {
        setCheckingStatus(true);
        setStatusError(null);
        setPaymentStatus(null);
        setNotPaidError(false);
        try {
            const paymentId = paymentData?.Id;
            if (!paymentId) throw new Error("Payment ID not available.");
            const res = await fetch("/api/process-payment", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
            });
            const result = await res.json();
            if (!res.ok) {
                if (result.error && result.error === "Plan is not Paid yet") {
                    setNotPaidError(true);
                    return;
                }
                throw new Error(result.message || "Failed to check payment status");
            }
            setPaymentStatus(result.data || result);
        } catch (e) {
            setStatusError(e.message || "Failed to check payment status.");
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleAddDomain = () => {
        if (domains.length < domainLimit) {
            setDomains([...domains, ""]);
        }
    };

    const handleRegisterDomain = async () => {
        setRegistering(true);
        setRegisterError(null);
        setRegisterSuccess("");
        try {
            const filteredDomains = domains.map(d => d.trim()).filter(Boolean);
            if (!filteredDomains.length) throw new Error("Please enter at least one domain.");
            if (filteredDomains.length > domainLimit) throw new Error(`Maximum ${domainLimit} domains allowed.`);
            const res = await fetch(`/api/register-domain?invoiceId=${invoiceId}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selected_domains: filteredDomains })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to register domains");
            setRegisterSuccess("Domains registered successfully!");
            setDomains([""]);
        } catch (e) {
            setRegisterError(e.message || "Failed to register domains.");
        } finally {
            setRegistering(false);
        }
    };

    // --- RENDER ---
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-2 bg-black/70 backdrop-blur-[3px] overflow-y-auto py-8">
            <div className="relative w-full max-w-[40%] bg-gradient-to-br from-[#18181c] via-[#232339] to-[#18181c] rounded-3xl shadow-lg border border-gray-700 p-0 sm:p-8 animate-fade-in-up overflow-hidden max-h-[95vh] flex flex-col mt-[100px]">
                {/* Loader overlay */}
                {(loadingAssets || creatingPayment || checkingStatus || registering) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-3xl">
                        <SimpleSpinner size={54} color="#e5e7eb" />
                    </div>
                )}
                {/* Close (sticky/fixed at top for scroll) */}
                <button
                    className="sticky top-0 left-0 right-0 ml-auto mr-2 mt-2 text-gray-400 hover:text-gray-200 text-3xl z-10 transition bg-transparent"
                    style={{ zIndex: 100 }}
                    onClick={onClose}
                    aria-label="Close"
                >×</button>
                {/* Header SVG */}
                <div className="pt-2 pb-2">
                    <ModalPaySVG />
                </div>
                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-100 mb-2 tracking-wide">
                    Crypto Payment
                </h2>
                <p className="mb-2 text-center text-gray-400 font-mono text-md">
                    Secure your plan & monitor your domains
                </p>
                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 sm:px-0 pb-4">
                    {/* Select Coin & Blockchain */}
                    {!showRegisterForm && !paymentData && (
                        <>
                            {assetsError && (
                                <div className="bg-red-900 text-red-200 p-2 rounded mb-4 text-center">{assetsError}</div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-1 font-mono">Select Coin:</label>
                                    <select
                                        className="w-full p-3 rounded bg-gray-800 text-white text-lg border border-gray-700 focus:ring-2 focus:ring-gray-500"
                                        value={selectedAsset?.Code || ""}
                                        onChange={e => {
                                            const asset = assets.find(a => a.Code === e.target.value);
                                            setSelectedAsset(asset || null);
                                            setSelectedBlockchain(null);
                                        }}
                                        disabled={loadingAssets || !assets.length}
                                    >
                                        <option value="">-- Select Coin --</option>
                                        {assets.map(asset => (
                                            <option key={asset.Code} value={asset.Code}>
                                                {asset.Name} ({asset.Code.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1 font-mono">Select Blockchain:</label>
                                    <select
                                        className="w-full p-3 rounded bg-gray-800 text-white text-lg border border-gray-700 focus:ring-2 focus:ring-gray-500"
                                        value={selectedBlockchain?.Code || ""}
                                        onChange={e => {
                                            const bc = selectedAsset?.Blockchains?.find(bc => bc.Code === e.target.value);
                                            setSelectedBlockchain(bc || null);
                                        }}
                                        disabled={!selectedAsset}
                                    >
                                        <option value="">-- Select Blockchain --</option>
                                        {(selectedAsset?.Blockchains || []).map(bc => (
                                            <option key={bc.Code} value={bc.Code}>
                                                {bc.Name} {bc.Code ? `(${bc.Code.toUpperCase()})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                className="mt-8 w-full py-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg transition-all"
                                onClick={handleCreatePayment}
                                disabled={!selectedAsset || !selectedBlockchain || creatingPayment}
                            >
                                {creatingPayment ? "Processing..." : "Continue & Show Payment Instructions"}
                            </button>
                            {createError && <div className="text-red-400 mt-2 text-center">{createError}</div>}
                        </>
                    )}

                    {/* Payment instructions */}
                    {!showRegisterForm && paymentData && (
                        <>
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 my-4 shadow">
                                <h3 className="text-xl font-bold text-gray-100 mb-2">Send Payment</h3>
                                <div className="mb-3">
                                    <span className="text-gray-300 font-mono">Recipient Address:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="break-all text-gray-200 font-mono text-lg select-all">
                                            {paymentData?.RecipientAddress || "-"}
                                        </span>
                                        <button
                                            className="text-xs px-2 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-100 transition"
                                            onClick={() => navigator.clipboard.writeText(paymentData?.RecipientAddress)}
                                            title="Copy to clipboard"
                                        >Copy</button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <span className="text-gray-300 font-mono">Amount:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-yellow-300 text-lg select-all">
                                            {formatAmount(paymentData?.Amount, decimals)} {paymentData?.AssetCode?.toUpperCase()}
                                        </span>
                                        <button
                                            className="text-xs px-2 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-100 transition"
                                            onClick={() => navigator.clipboard.writeText(formatAmount(paymentData?.Amount, decimals))}
                                            title="Copy amount"
                                        >Copy</button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <span className="text-gray-300 font-mono">Blockchain:</span>
                                    <div className="ml-2 inline-block font-bold text-gray-200">
                                        {paymentData?.BlockchainCode?.toUpperCase()}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <span className="text-gray-300 font-mono">Payment ID:</span>
                                    <span className="ml-2 font-mono text-gray-200">{paymentData?.Id || "-"}</span>
                                </div>
                                <div className="flex justify-center mt-3">
                                    <div
                                        style={{
                                            background: "#fff",
                                            borderRadius: 16,
                                            padding: 14,
                                            boxShadow: "0 0 6px #0004"
                                        }}
                                    >
                                        <QRCode
                                            value={paymentData.RecipientAddress}
                                            bgColor="#fff"
                                            fgColor="#2d3748"
                                            size={136}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800 border-l-4 border-yellow-400 rounded-xl p-3 mt-2 text-yellow-200 font-mono">
                                <b>Important:</b> The amount you send must <u>exactly</u> match the amount shown above.<br />
                                If you are sending from an exchange or app (e.g. Binance) that charges a withdrawal fee, please <u>add the fee</u> to your transfer so we receive the exact required amount.<br />
                                Payments with incorrect amounts may not be processed or credited, and cannot be refunded.
                            </div>
                            <div className="mt-8 text-center">
                                {notPaidError && (
                                    <div className="text-yellow-400 mt-4">
                                        Payment not received yet. Please try again in a few moments.<br />
                                    </div>
                                )}
                                <button
                                    onClick={handleCheckPayment}
                                    className="py-3 px-8 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold text-lg"
                                    disabled={checkingStatus}
                                >
                                    {checkingStatus ? "Checking Payment Status..." : "I've Paid, Check Payment Status"}
                                </button>
                                {statusError && <div className="text-red-400 mt-2">{statusError}</div>}
                            </div>
                        </>
                    )}

                    {/* Register Domain */}
                    {showRegisterForm && (
                        <div className="mt-6 border-t border-gray-700 pt-4 bg-gray-900 rounded-2xl shadow">
                            <h3 className="text-xl font-bold text-gray-100 mb-3">Register Domains to Monitor</h3>
                            <div className="space-y-2">
                                {domains.map((domain, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            className="w-full p-3 rounded bg-gray-800 text-white text-lg border border-gray-700 focus:ring-gray-500"
                                            placeholder="Enter domain (e.g. example.com)"
                                            value={domain}
                                            onChange={e => {
                                                const newDomains = [...domains];
                                                newDomains[idx] = e.target.value;
                                                setDomains(newDomains);
                                            }}
                                        />
                                        {domains.length > 1 && (
                                            <button
                                                className="bg-gray-700 hover:bg-gray-600 px-3 rounded text-white text-md font-bold"
                                                onClick={() => setDomains(domains.filter((_, i) => i !== idx))}
                                                title="Remove"
                                            >-</button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    className="bg-gray-200 hover:bg-gray-100 px-4 py-2 rounded text-gray-900 text-lg font-bold mt-1"
                                    onClick={handleAddDomain}
                                    disabled={domains.length >= domainLimit}
                                >+ Add Domain</button>
                                {domains.length >= domainLimit && (
                                    <div className="text-xs text-yellow-400 mt-1">
                                        Maximum {domainLimit} domains allowed for this plan.
                                    </div>
                                )}
                            </div>
                            <button
                                className="w-full py-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold mt-4 text-lg"
                                onClick={handleRegisterDomain}
                                disabled={registering}
                            >
                                {registering ? "Registering..." : "Register Domains"}
                            </button>
                            {registerError && <div className="text-red-400 mt-2">{registerError}</div>}
                            {registerSuccess && <div className="text-green-400 mt-2">{registerSuccess}</div>}
                        </div>
                    )}
                </div>
                <style jsx>{`
                    .animate-fade-in-up {
                        animation: fadeInUp .4s cubic-bezier(.33,1,.68,1);
                    }
                    @keyframes fadeInUp {
                        from { opacity:0; transform:translateY(24px) scale(0.96);}
                        to { opacity:1; transform:translateY(0) scale(1);}
                    }
                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: #6b7280 #232339;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #6b7280;
                        border-radius: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #232339;
                    }
                `}</style>
            </div>
        </div>
    );
}