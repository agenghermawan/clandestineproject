"use client";

import { useEffect, useState } from "react";
import PaymentFlowModal from "../../components/pricing/payment_flow_modal";
import AnimatedDarkWebBackground from "../../components/ui/myplan-background";
import PaymentsTable from "../../components/payment/list_payment";

export default function MyPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalProps, setModalProps] = useState({});

    useEffect(() => {
        setLoading(true);
        fetch("/api/my-payment", { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch payments");
                return res.json();
            })
            .then((data) => setPayments(data?.data || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoadingPlan(true);
        fetch("/api/my-plan", { credentials: "include" })
            .then(async (res) => res.json())
            .then((data) => setPlan(data?.data || null))
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

    const isUnlimited = plan?.domain === "unlimited";
    const expiredDate = plan?.expired ? new Date(plan.expired) : null;
    const isExpired = expiredDate && expiredDate < new Date();

    return (
        <AnimatedDarkWebBackground>
            <PaymentFlowModal {...modalProps} show={showPaymentModal} />

            <div className="max-w-5xl mx-auto my-10 text-white px-6">
                {/* Header / Hero Section */}
                <div className="bg-gradient-to-r from-[#f03262]/20 via-[#6b21a8]/20 to-[#0ff]/20 backdrop-blur-md border border-[#6b21a8]/40 rounded-2xl p-8 shadow-lg mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#f03262] via-[#6b21a8] to-[#0ff]">
                                My Payment Dashboard
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Manage your active plan and review your past transactions.
                            </p>
                        </div>
                        <a
                            href="/pricing"
                            className="bg-[#f03262] hover:bg-[#c91d4e] px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200"
                        >
                            {isExpired ? "Renew Plan" : "Upgrade Plan"}
                        </a>
                    </div>
                </div>

                {/* Active Plan Section */}
                {loadingPlan ? (
                    <div className="text-center text-gray-400 mb-10">Checking active plan...</div>
                ) : plan ? (
                    <div className="mb-10 bg-[#1b1b2a]/80 border border-[#6b21a8]/50 rounded-2xl shadow-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#0ff]">
                                    {isUnlimited ? "Unlimited Plan" : `Plan ID: ${plan.plan}`}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Expired At:{" "}
                                    {expiredDate
                                        ? expiredDate.toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                            {isExpired && (
                                <span className="text-red-400 font-semibold text-sm bg-red-500/10 px-3 py-1 rounded-full">
                                    Expired
                                </span>
                            )}
                        </div>

                        {/* Plan Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-[#0ff]/10 to-[#0ff]/5 p-4 rounded-xl border border-[#0ff]/40 text-center hover:scale-105 transition">
                                <div className="text-[#0ff] font-bold text-xl">
                                    {isUnlimited ? "∞" : plan.domain}
                                </div>
                                <div className="text-gray-400 text-sm">Domain Limit</div>
                            </div>
                            <div className="bg-gradient-to-r from-[#6b21a8]/10 to-[#f03262]/10 p-4 rounded-xl border border-[#6b21a8]/40 text-center hover:scale-105 transition">
                                <div className="text-[#f03262] font-bold text-xl">
                                    {plan.registered_domain?.length || 0}
                                </div>
                                <div className="text-gray-400 text-sm">Registered</div>
                            </div>
                            <div className="bg-gradient-to-r from-[#f03262]/10 to-[#0ff]/10 p-4 rounded-xl border border-[#f03262]/40 text-center hover:scale-105 transition">
                                <div className="text-yellow-400 font-bold text-xl">
                                    {isUnlimited
                                        ? "∞"
                                        : (Number(plan.domain) || 0) -
                                        (plan.registered_domain?.length || 0)}
                                </div>
                                <div className="text-gray-400 text-sm">Remaining</div>
                            </div>
                        </div>

                        {/* Registered Domains */}
                        {plan.registered_domain?.length > 0 && (
                            <div className="mt-6">
                                <p className="text-gray-400 text-sm mb-2">Registered Domains:</p>
                                <div className="bg-[#141422] rounded-lg p-3 border border-[#6b21a8]/30">
                                    {plan.registered_domain.map((d, i) => (
                                        <div key={i} className="text-gray-200 font-mono text-sm border-b border-gray-800 last:border-none py-1">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Transaction History */}
                <div className="border-t border-[#6b21a8]/30 pt-8">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f03262] via-[#6b21a8] to-[#0ff] mb-2">
                        Transaction History
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Review all your previous payments and their statuses.
                    </p>

                    {loading ? (
                        <div className="text-center text-gray-400">Loading payments...</div>
                    ) : error ? (
                        <div className="text-center text-red-400">{error}</div>
                    ) : payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mb-4 animate-pulse" viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="28" stroke="#f03262" strokeWidth="2" />
                                <path d="M24 28h16v8H24z" fill="#1b1b2a" stroke="#f03262" />
                                <circle cx="32" cy="44" r="2" fill="#f03262" />
                            </svg>
                            <h3 className="text-lg font-semibold mb-1">No Transactions Yet</h3>
                            <p className="text-gray-500 text-sm">
                                Start your first payment by selecting a plan on the{" "}
                                <a href="/pricing" className="text-pink-400 underline">
                                    Pricing Page
                                </a>.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-[#1b1b2a]/70 border border-[#6b21a8]/40 rounded-2xl p-4 shadow-lg">
                            <PaymentsTable payments={payments} onAction={handleShowModal} />
                        </div>
                    )}
                </div>
            </div>
        </AnimatedDarkWebBackground>
    );
}
