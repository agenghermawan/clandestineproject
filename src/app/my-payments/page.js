"use client";

import {useEffect, useState} from "react";
import PaymentFlowModal from "../../components/pricing/payment_flow_modal";
import AnimatedDarkWebBackground from "../../components/ui/myplan-background";

// Simple accent SVG for unlimited plan card
function UnlimitedSVG() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
             className="mx-auto mb-4 animate-fade-in">
            <circle cx="32" cy="32" r="28" stroke="#0ff" strokeWidth="3" opacity="0.7" />
            <path d="M18 32c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14" stroke="#f03262" strokeWidth="2" fill="none"/>
            <path d="M32 46c-7.732 0-14-6.268-14-14" stroke="#6b21a8" strokeWidth="2" fill="none"/>
            <text x="32" y="38" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold" opacity="0.9">∞</text>
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn .8s;
                }
                @keyframes fadeIn {
                    from { opacity:0; transform:scale(.95);}
                    to { opacity:1; transform:scale(1);}
                }
            `}</style>
        </svg>
    );
}

function ExpiredBanner({ expiredDate }) {
    return (
        <div className="bg-gradient-to-r from-[#f03262]/90 via-[#6b21a8]/80 to-[#0ff]/80 text-white rounded-xl px-6 py-4 shadow-lg mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-2 border-[#f03262]">
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

export default function MyPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalProps, setModalProps] = useState({});

    // Fetch payments
    useEffect(() => {
        setLoading(true);
        fetch("/api/my-payment", {credentials: "include"})
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch payments");
                return res.json();
            })
            .then((data) => {
                if (data && Array.isArray(data.data)) {
                    setPayments(data.data);
                } else {
                    setPayments([]);
                }
            })
            .catch((err) => {
                setError(err.message || "Error loading payments");
                setPayments([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch plan
    useEffect(() => {
        setLoadingPlan(true);
        fetch("/api/my-plan", {credentials: "include"})
            .then(async (res) => {
                const data = await res.json();
                if (data && data.data) {
                    setPlan(data.data);
                } else {
                    setPlan(null);
                }
            })
            .catch(() => setPlan(null))
            .finally(() => setLoadingPlan(false));
    }, []);

    const handleShowModal = (payment) => {
        const isBypass = payment.payment?.Id === "x9BG0DgLaT6HY2RP";
        const domainLimit = Number(payment.domain) || 1;

        setModalProps({
            show: true,
            onClose: () => setShowPaymentModal(false),
            invoiceId: payment.invoice?.Id,
            idPricing: payment.id,
            plan: payment.plan,
            paymentData: payment.payment || null,
            forceRegisterDomain: isBypass,
            domainLimit,
            registeredDomains: plan?.registered_domain || [],
        });
        setShowPaymentModal(true);
    };

    // Detect plan status
    const isUnlimited = plan?.domain === "unlimited";
    let isExpired = false;
    let expiredDateString = "-";
    if (plan?.expired) {
        const expiredDate = new Date(plan.expired);
        expiredDateString = expiredDate.toLocaleString();
        const nowUTC = new Date();
        if (expiredDate < nowUTC) isExpired = true;
    }

    const showPaymentsTable = !plan || isExpired;

    return (
        <AnimatedDarkWebBackground>
            <PaymentFlowModal {...modalProps} show={showPaymentModal}/>
            <div className="max-w-4xl mx-auto my-10 bg-[#232339] rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    My Payments
                </h1>
                <p className="text-gray-400 mb-10 text-center">
                    {showPaymentsTable && payments.length > 0
                        ? (
                            <span>
                              See your payment history and complete your payment to activate your plan.<br />
                              For a new subscription, see the{" "}
                                <a href="/pricing" className="text-pink-400 underline hover:text-pink-300">Pricing</a> page.
                            </span>
                        )
                        : ""
                    }
                </p>

                {/* PLAN CARD */}
                {loadingPlan ? (
                    <div className="text-center mb-6 text-gray-400">Checking active plan...</div>
                ) : plan ? (
                    <>
                        {isExpired && (
                            <ExpiredBanner expiredDate={expiredDateString} />
                        )}
                        {isUnlimited ? (
                            <div className="mb-8 max-w-md mx-auto bg-[#232339] rounded-2xl p-8 shadow-2xl border border-[#0ff] relative overflow-hidden">
                                <UnlimitedSVG />
                                <div className="text-lg font-bold text-[#0ff] mb-1">Active Plan (Unlimited)</div>
                                <div className="text-white font-mono mb-2">ID: {plan.plan}</div>
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
                                <div className="text-gray-400 text-sm mt-4">
                                    Expired At: {plan.expired ? new Date(plan.expired).toLocaleString() : "-"}
                                </div>
                                <div className="mt-8 text-center">
                                    <span className="inline-block bg-gradient-to-r from-[#0ff] via-[#f03262] to-[#6b21a8] bg-clip-text text-transparent text-lg font-bold">
                                        Unlimited domain monitoring enabled for this plan!
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="mb-8 max-w-md mx-auto bg-gradient-to-br from-[#181825] to-[#232339] border border-[#f03262] rounded-xl shadow-xl p-6 flex flex-col items-center">
                                <div className="text-lg font-bold text-pink-400 mb-1">Active Plan</div>
                                <div className="text-white font-mono mb-2">ID: {plan.plan}</div>
                                <div className="flex gap-8 items-center mb-2">
                                    <div>
                                        <div className="text-gray-400 text-sm">Domain Limit</div>
                                        <div className="text-white font-bold text-lg">{plan.domain}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Registered</div>
                                        <div
                                            className="text-green-400 font-bold text-lg">{plan.registered_domain?.length || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Remaining</div>
                                        <div className="text-yellow-400 font-bold text-lg">
                                            {(Number(plan.domain) || 0) - (plan.registered_domain?.length || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-400 text-sm">
                                    Expired At: {plan.expired ? new Date(plan.expired).toLocaleString() : "-"}
                                </div>
                                {plan.registered_domain?.length > 0 && (
                                    <div className="mt-3 text-left w-full">
                                        <div className="text-xs text-gray-400 mb-1">Registered Domains:</div>
                                        <ul className="bg-[#1a1b20] rounded p-2">
                                            {plan.registered_domain.map((d, idx) => (
                                                <li key={idx}
                                                    className="text-white font-mono py-1 border-b border-gray-800 last:border-b-0">{d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : null}

                {loading ? (
                    <div className="text-center text-gray-400">Loading payments...</div>
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : !showPaymentsTable ? (
                    // Payment list/table not shown if plan active
                    null
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        {/* SVG Dark Web Style */}
                        <svg
                            className="w-20 h-20 mb-6 animate-pulse"
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
                            <path
                                d="M32 20v10"
                                stroke="#f03262"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="animate-bounce"
                            />
                            <circle cx="32" cy="44" r="2.5" fill="#f03262"/>
                            <rect
                                x="24"
                                y="26"
                                width="16"
                                height="6"
                                rx="3"
                                fill="#18181c"
                                stroke="#f03262"
                                strokeWidth="1"
                            />
                        </svg>
                        <h2 className="text-xl font-bold mb-2">No Payments Found</h2>
                        <p className="text-center text-gray-400 max-w-sm">
                            You haven't made any payments yet.
                            <br/>
                            Purchase a subscription plan to get started and monitor your domains.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full font-mono text-sm bg-gradient-to-br from-[#18181c] via-[#232339] to-[#18181c] border border-[#2e2e2e] rounded-xl shadow-2xl overflow-hidden">
                            <thead>
                            <tr className="text-left border-b border-[#2e2e2e] text-[#f03262] bg-gradient-to-r from-[#26263a] to-[#1e1e24]">
                                <th className="py-4 px-4 text-center w-8">No</th>
                                <th className="py-4 px-4">Invoice ID</th>
                                <th className="py-4 px-4">Domain</th>
                                <th className="py-4 px-4">Plan</th>
                                <th className="py-4 px-4">Payment ID</th>
                                <th className="py-4 px-4">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((payment, idx) => {
                                const invoiceId = payment.invoice?.Id || "-";
                                const paymentId = payment.payment?.Id || "-";
                                return (
                                    <tr
                                        key={payment.id + idx}
                                        className="border-b border-[#29293a] hover:bg-gradient-to-r from-[#232339] to-[#f03262]/10 group transition-all duration-150"
                                    >
                                        <td className="py-3 px-4 text-center font-bold text-pink-400">
                                            {idx + 1}
                                        </td>
                                        <td className="py-3 px-4">{invoiceId}</td>
                                        <td className="py-3 px-4">{payment.domain || "-"}</td>
                                        <td className="py-3 px-4 capitalize">{payment.plan || "-"}</td>
                                        <td className="py-3 px-4 font-mono text-green-400">{paymentId}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleShowModal(payment)}
                                                className="bg-gradient-to-r from-[#f03262] to-[#232339] hover:from-[#c91d4e] hover:to-[#232339] px-4 py-2 rounded-lg text-xs font-bold text-white transition-all duration-150 shadow-md shadow-pink-800/30 group-hover:scale-105"
                                            >
                                                {payment.payment?.Id
                                                    ? "Check Payment & Register Domain"
                                                    : "Pay Now"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AnimatedDarkWebBackground>
    );
}