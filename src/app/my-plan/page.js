'use client';

import {useEffect, useState} from "react";
import AnimatedDarkWebBackground from "../../components/ui/myplan-background";


function UnlimitedSVG() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
             className="mx-auto mb-4 animate-fade-in">
            <circle cx="32" cy="32" r="28" stroke="#0ff" strokeWidth="3" opacity="0.7"/>
            <path d="M18 32c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14" stroke="#f03262" strokeWidth="2"
                  fill="none"/>
            <path d="M32 46c-7.732 0-14-6.268-14-14" stroke="#6b21a8" strokeWidth="2" fill="none"/>
            <text x="32" y="38" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold" opacity="0.9">∞</text>
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn .8s;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </svg>
    );
}

function RegisterDomainModal({show, onClose, invoiceId, domainLimit, registeredDomains, onSuccess, isUnlimited}) {
    const [domains, setDomains] = useState([""]);
    const [registering, setRegistering] = useState(false);
    const [registerError, setRegisterError] = useState(null);
    const [registerSuccess, setRegisterSuccess] = useState("");

    useEffect(() => {
        if (show) {
            setDomains(registeredDomains.length > 0 ? [...registeredDomains] : [""]);
            setRegisterError(null);
            setRegisterSuccess("");
            setRegistering(false);
        }
    }, [show, registeredDomains]);

    const handleAddDomain = () => {
        setDomains([...domains, ""]);
    };

    const handleRegisterDomain = async () => {
        setRegistering(true);
        setRegisterError(null);
        setRegisterSuccess("");
        try {
            const filteredDomains = domains.map(d => d.trim()).filter(Boolean);
            if (!filteredDomains.length) throw new Error("Please enter at least one domain.");
            if (!isUnlimited && filteredDomains.length > domainLimit) throw new Error(`Maximum ${domainLimit} domains allowed.`);
            if (!invoiceId) throw new Error("Invoice ID is missing.");
            const res = await fetch(`/api/register-domain?invoiceId=${invoiceId}`, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({selected_domains: filteredDomains})
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to register domains");
            setRegisterSuccess("Domains registered successfully!");
            setDomains(filteredDomains);
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            setRegisterError(e.message || "Failed to register domains.");
        } finally {
            setRegistering(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
            <div className="relative w-full max-w-md bg-[#232339] rounded-2xl shadow-xl p-6 animate-fade-in">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >×
                </button>
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    Register Domains
                </h2>
                <div className="mb-2 text-center text-gray-300 text-sm">
                    {isUnlimited ? (
                        <>You can register <span className="font-bold text-yellow-400">unlimited</span> domains for this
                            plan.</>
                    ) : (
                        <>You can register up to <span
                            className="font-bold text-yellow-400">{domainLimit}</span> domains for this plan.</>
                    )}
                </div>
                <div className="space-y-2">
                    {domains.map((domain, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                className="w-full p-2 rounded bg-gray-700 text-white"
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
                                    className="bg-red-600 hover:bg-red-700 px-2 rounded text-white text-sm font-bold"
                                    onClick={() => setDomains(domains.filter((_, i) => i !== idx))}
                                    title="Remove"
                                >-</button>
                            )}
                        </div>
                    ))}
                    <button
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm font-bold mt-1"
                        onClick={handleAddDomain}
                        disabled={!isUnlimited && domains.length >= domainLimit}
                    >+ Add Domain
                    </button>
                    {!isUnlimited && domains.length >= domainLimit && (
                        <div className="text-xs text-yellow-400 mt-1">
                            Maximum {domainLimit} domains allowed.
                        </div>
                    )}
                </div>
                <button
                    className="w-full py-2 rounded bg-[#f33d74] hover:bg-[#e63368] text-white font-bold mt-4"
                    onClick={handleRegisterDomain}
                    disabled={registering}
                >
                    {registering ? "Registering..." : "Register Domains"}
                </button>
                {registerError && <div className="text-red-400 mt-2">{registerError}</div>}
                {registerSuccess && <div className="text-green-400 mt-2">{registerSuccess}</div>}
            </div>
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn .25s;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

function ExpiredBanner({expiredDate}) {
    return (
        <div
            className="bg-gradient-to-r from-[#f03262]/90 via-[#6b21a8]/80 to-[#0ff]/80 text-white rounded-xl px-6 py-4 shadow-lg mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-2 border-[#f03262]">
            <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-yellow-300 animate-pulse" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="15" stroke="#f03262" strokeWidth="2" fill="#232339"/>
                    <path d="M16 9v6m0 4h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                    <div className="font-bold text-xl">Your plan has expired!</div>
                    <div className="text-yellow-100 text-sm">
                        Expired at: <span className="font-mono">{expiredDate}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2 md:mt-0">
                <a
                    href="/pricing"
                    className="inline-block bg-[#f03262] hover:bg-[#c91d4e] text-white px-5 py-2 rounded-lg font-semibold shadow transition-all duration-150"
                >
                    Renew / Choose New Plan
                </a>
            </div>
        </div>
    );
}

export default function MyPlanPage() {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = () => {
        setLoading(true);
        fetch("/api/my-plan", {credentials: "include"})
            .then(async (res) => {
                const data = await res.json();
                if (data && data.data) {
                    setPlan(data.data);
                    setError(null);
                } else {
                    setPlan(null);
                    setError(null);
                }
            })
            .catch((err) => {
                setError(err.message || "Error loading plan");
                setPlan(null);
            })
            .finally(() => setLoading(false));
    };

    const isUnlimited = plan?.domain === "unlimited";
    const domainsUsed = plan?.registered_domain?.length || 0;
    const domainsMax = isUnlimited ? Infinity : Number(plan?.domain) || 0;

    // check expired. Plan is expired if expired date < now (UTC)
    let isExpired = false;
    let expiredDateString = "-";
    if (plan?.expired) {
        const expiredDate = new Date(plan.expired);
        expiredDateString = expiredDate.toLocaleString();
        const nowUTC = new Date();
        if (expiredDate < nowUTC) isExpired = true;
    }

    return (
        <AnimatedDarkWebBackground>
            <RegisterDomainModal
                show={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                invoiceId={plan?.plan}
                domainLimit={domainsMax}
                registeredDomains={plan?.registered_domain || []}
                onSuccess={fetchPlan}
                isUnlimited={isUnlimited}
            />
            <div className="max-w-4xl mx-auto my-10 bg-[#232339] rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">My Plan</h1>
                {loading ? (
                    <div className="text-center text-gray-400">Loading plan info...</div>
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : !plan ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <UnlimitedSVG/>
                        <h2 className="text-xl font-bold mb-2">No Active Plan Found</h2>
                        <p className="text-center text-gray-400 max-w-sm">
                            You don't have an active subscription plan yet.<br/>
                            Please purchase a plan to start monitoring your domains.
                        </p>
                    </div>
                ) : (
                    <>
                        {isExpired && (
                            <ExpiredBanner expiredDate={expiredDateString}/>
                        )}
                        {isUnlimited ? (
                            <div
                                className="bg-[#232339] rounded-2xl p-8 shadow-2xl mb-8 border border-[#0ff] relative overflow-hidden">
                                <UnlimitedSVG/>
                                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                                    <div>
                                        <div className="text-gray-400 text-sm">Plan ID</div>
                                        <div className="text-white font-mono">{plan.plan}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Expired At</div>
                                        <div className="text-white">{expiredDateString}</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex gap-12 items-center justify-center">
                                    <div>
                                        <div className="text-gray-400 text-sm">Domain Limit</div>
                                        <div className="text-[#0ff] text-2xl font-extrabold">Unlimited</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Remaining</div>
                                        <div className="text-[#f03262] text-2xl font-extrabold">Unlimited</div>
                                    </div>
                                </div>
                                <div className="mt-8 text-center">
                                    <span
                                        className="inline-block bg-gradient-to-r from-[#0ff] via-[#f03262] to-[#6b21a8] bg-clip-text text-transparent text-lg font-bold">
                                        Unlimited domain monitoring enabled for this plan!
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#232339] rounded-2xl p-8 shadow-2xl mb-8 border border-[#f03262]">
                                <div className="flex flex-wrap gap-4 justify-between items-center">
                                    <div>
                                        <div className="text-gray-400 text-sm">Plan ID</div>
                                        <div className="text-white font-mono">{plan.plan}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Expired At</div>
                                        <div className="text-white">{expiredDateString}</div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-4 items-center">
                                    <div>
                                        <div className="text-gray-400 text-sm">Domain Limit</div>
                                        <div className="text-white text-xl font-bold">{domainsMax}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Registered</div>
                                        <div className="text-green-400 text-xl font-bold">{domainsUsed}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Remaining</div>
                                        <div
                                            className="text-yellow-400 text-xl font-bold">{domainsMax - domainsUsed}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isUnlimited && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-lg font-semibold text-white">Registered Domains</div>
                                    {(domainsUsed < domainsMax) && !isExpired && (
                                        <button
                                            onClick={() => setShowRegisterModal(true)}
                                            className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-xs font-semibold text-white transition"
                                        >
                                            + Register New Domain
                                        </button>
                                    )}
                                </div>
                                <ul className="bg-[#181825] rounded-lg p-4">
                                    {plan.registered_domain?.length > 0 ? (
                                        plan.registered_domain.map((d, idx) => (
                                            <li key={idx}
                                                className="py-1 text-white font-mono border-b border-gray-800 last:border-b-0">{d}</li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400">No domains registered yet.</li>
                                    )}
                                </ul>
                                {(domainsUsed >= domainsMax && !isExpired) && (
                                    <div className="mt-4 text-yellow-400 text-center">
                                        Domain limit reached for this plan. Upgrade your plan to register more domains.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AnimatedDarkWebBackground>
    );
}