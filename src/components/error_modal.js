export default function ErrorModal({show, message, onClose, userDomains, plan}) {
    if (!show) return null;
    const isExpired = message && message.toLowerCase().includes("expired");
    const isNotAllowed = message && (
        message.toLowerCase().includes("not allowed") ||
        message.toLowerCase().includes("not registered") ||
        message.toLowerCase().includes("no domain")
    );
    const showAllowed = isNotAllowed && plan?.domain !== "unlimited" && userDomains?.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#232339] rounded-2xl shadow-xl p-6 max-w-md w-full relative flex flex-col items-center">
                <button
                    className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >×
                </button>
                <div className="mb-2 mt-2 flex justify-center">
                    {isExpired ? (
                        <svg width="60" height="60" fill="none" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="27" stroke="#f03262" strokeWidth="3" fill="#18181c"/>
                            <path d="M30 17v13l9 6" stroke="#f03262" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="30" cy="30" r="23" stroke="#fff" strokeDasharray="2 6" opacity="0.2"/>
                            <g>
                                <circle cx="30" cy="30" r="10" fill="#f03262" fillOpacity="0.08"/>
                                <path d="M24 38c2.7 2.5 9.3 2.5 12 0" stroke="#f03262" strokeWidth="2"
                                      strokeLinecap="round"/>
                                <ellipse cx="30" cy="28" rx="1.8" ry="1.8" fill="#fff"/>
                            </g>
                            <text x="30" y="54" textAnchor="middle" fontSize="12" fill="#f03262"
                                  fontWeight="bold">EXPIRED
                            </text>
                        </svg>
                    ) : (
                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="drop-shadow-xl">
                            <circle cx="28" cy="28" r="26" fill="#18181c" stroke="#f03262" strokeWidth="2"/>
                            <rect x="18" y="24" width="20" height="14" rx="4" fill="#232339" stroke="#f03262"
                                  strokeWidth="1.5"/>
                            <path d="M28 31v-3" stroke="#f03262" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="28" cy="31" r="2" fill="#f03262"/>
                            <rect x="23" y="22" width="10" height="6" rx="3" fill="#101014" stroke="#f03262"
                                  strokeWidth="1"/>
                        </svg>
                    )}
                </div>
                <h2 className={`text-lg font-bold mb-4 text-center ${isExpired ? "text-yellow-400" : "text-red-400"}`}>
                    {isExpired ? "Your Plan Has Expired" : "Domain not allowed"}
                </h2>
                <div className="text-white text-center whitespace-pre-line mb-2">
                    {isExpired
                        ? "Your subscription plan has expired. Please renew or purchase a new plan to continue accessing this feature."
                        : message}
                </div>
                {showAllowed && (
                    <div className="mt-2 text-sm text-cyan-400 text-center">
                        Allowed domains: {userDomains.join(", ")}
                    </div>
                )}
                {isExpired && (
                    <a
                        href="/pricing"
                        className="mt-3 bg-[#f03262] hover:bg-[#c91d4e] text-white px-5 py-2 rounded-lg font-semibold shadow transition-all"
                    >
                        Renew / Choose Plan
                    </a>
                )}
            </div>
        </div>
    );
}

