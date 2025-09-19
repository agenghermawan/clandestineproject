"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import PaymentFlowModalPricing from "../../components/pricing/payment_flow_modal_pricing";
import ButtonSpinner from "../../components/ui/button-spinner";
import {useAuth} from "../../context/AuthContext";

const HARDCODE_PRICING = [
    {
        "_id": "6866108da3a6824bb869e488",
        "description": "For small-scale security monitoring",
        "domain": "1",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "24/7 vulnerability scanning",
            "Real-time alerts",
            "Basic reporting"
        ],
        "monthly": "600",
        "quarterly": "1620",
        "yearly": "5760"
    },
    {
        "_id": "6866108da3a6824bb869e489",
        "description": "For growing businesses",
        "domain": "5",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Priority scanning queue",
            "Advanced reporting",
            "API access",
            "Email support"
        ],
        "isPopular": true,
        "monthly": "900",
        "quarterly": "2430",
        "yearly": "8640"
    },
    {
        "_id": "6866108da3a6824bb869e48a",
        "description": "For professional security teams",
        "domain": "10",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Dedicated scan nodes",
            "Custom scan profiles",
            "Scheduled scanning",
            "Phone & email support"
        ],
        "monthly": "1600",
        "quarterly": "4320",
        "yearly": "15360"
    },
    {
        "_id": "6866108da3a6824bb869e48b",
        "description": "For enterprise security operations",
        "domain": "20",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Dedicated account manager",
            "Compliance reporting",
            "Integration support",
            "24/7 technical support"
        ],
        "monthly": "2700",
        "quarterly": "7290",
        "yearly": "25920"
    },
    {
        "_id": "6866108da3a6824bb869e48c",
        "description": "For large-scale security programs",
        "domain": "40",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Custom SLAs",
            "Executive reports",
            "Onboarding assistance",
            "Dedicated support line"
        ],
        "monthly": "5000",
        "quarterly": "13500",
        "yearly": "48000"
    },
    {
        "_id": "6866108da3a6824bb869e48d",
        "description": "For large-scale security programs",
        "domain": "60",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Custom SLAs",
            "Executive reports",
            "Onboarding assistance",
            "Dedicated support line"
        ],
        "monthly": "6000",
        "quarterly": "16200",
        "yearly": "57600"
    },
    {
        "_id": "6866108da3a6824bb869e48e",
        "description": "For global-scale security operations",
        "domain": "unlimited",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Unlimited domains",
            "Dedicated security advisor",
            "Enterprise integrations",
            "Highest priority support"
        ],
        "monthly": "10000",
        "quarterly": "27000",
        "yearly": "96000"
    },
    {
        "_id": "6866108da3a6824bb869e48f",
        "description": "Lifetime access for organizations with the highest security needs",
        "domain": "unlimited",
        "features": [
            "Unlimited scans",
            "Unlimited assets per domain",
            "Unlimited domains",
            "Dedicated security advisor",
            "Enterprise integrations",
            "Highest priority support",
            "Lifetime access"
        ],
        "isContact": true,
        "monthly": "Contact Sales",
        "quarterly": "Contact Sales",
        "yearly": "Contact Sales"
    },
];

export default function PricingPage() {
    const { authState } = useAuth(); // Ambil status login dari context
    const [currentPlan, setCurrentPlan] = useState(null);

    // Pricing
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState(null);

    // Modal states
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalProps, setModalProps] = useState({});

    // Fetch current plan after login
    useEffect(() => {
        if (authState !== "authenticated") {
            setCurrentPlan(null);
            return;
        }
        (async () => {
            try {
                const planRes = await fetch("/api/my-plan", { credentials: "include" });
                if (planRes.ok) {
                    const planData = await planRes.json();
                    setCurrentPlan(planData.data);
                }
            } catch {
                setCurrentPlan(null);
            }
        })();
    }, [authState]);

    // Fetch pricing
    useEffect(() => {
        if (authState !== "authenticated") {
            setPlans(HARDCODE_PRICING);
            setPlansLoading(false);
            setPlansError(null);
            return;
        }
        setPlansLoading(true);
        setPlansError(null);
        fetch("/api/pricing", { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) throw new Error("");
                const data = await res.json();
                setPlans(Array.isArray(data.data) ? data.data : []);
            })
            .catch((err) => {
                setPlansError(err.message || "");
                setPlans([]);
            })
            .finally(() => setPlansLoading(false));
    }, [authState]);

    // Subscription Modal logic
    const handlePlanSelect = (plan) => {
        if (plan.isContact) {
            window.location.href = "/contact-sales";
            return;
        }
        if (authState === "authenticated") {
            setSelectedPlan(plan);
            setShowSubscriptionModal(true);
        } else {
            window.location.href = `/login?redirect=/pricing&highlight=${plan._id}`;
        }
    };

    // Billing cycle selection → create invoice
    const handleSubscriptionSelect = async (billingCycle) => {
        setSubscriptionLoading(true);
        try {
            const res = await fetch("/api/create-invoice", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idPricing: selectedPlan._id,
                    plan: billingCycle,
                }),
            });
            if (!res.ok) throw new Error("Failed to create invoice");
            const data = await res.json();
            setShowSubscriptionModal(false);

            if (data.data.Id) {
                setModalProps({
                    show: true,
                    invoiceId: data.data.Id,
                    idPricing: selectedPlan._id,
                    plan: billingCycle,
                    domainLimit: selectedPlan.domain ? Number(selectedPlan.domain) : 1,
                    onClose: () => setShowPaymentModal(false),
                });
                setShowPaymentModal(true);
            } else {
                throw new Error("Invoice ID not found in response");
            }
        } catch (err) {
            alert("Failed to create invoice: " + (err.message || "Unknown error"));
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Format price
    const formatPrice = (price, cycle) => {
        if (
            typeof price === "string" &&
            price.toLowerCase() === "contact sales"
        ) {
            return (
                <span className="text-3xl font-bold text-[#f33d74]">
                    Contact Sales
                </span>
            );
        }
        if (!price || isNaN(Number(price))) return null;
        return (
            <>
                <span className="text-4xl font-bold">
                    ${Number(price).toLocaleString()}
                </span>
                <span className="text-gray-400">/{cycle}</span>
            </>
        );
    };

    // Check plan expired & label
    let isPlanActive = false;
    let expiredDateString = "-";
    let planName = null;
    if (currentPlan) {
        planName =
            currentPlan.displayName
                ? currentPlan.displayName
                : currentPlan.domain === "unlimited"
                    ? "Unlimited Domains"
                    : `${currentPlan.domain} Domain${currentPlan.domain === "1" ? "" : "s"}`;
        if (currentPlan.expired) {
            const expiredDate = new Date(currentPlan.expired);
            expiredDateString = expiredDate.toLocaleString();
            isPlanActive = expiredDate > new Date(); // still active
        } else {
            isPlanActive = true;
        }
    }

    return (
        <div className="relative overflow-x-hidden">
            <Script src="https://atlos.io/packages/app/atlos.js" strategy="afterInteractive" />

            {/* Payment Modal */}
            <PaymentFlowModalPricing {...modalProps} show={showPaymentModal} />

            {/* Subscription Modal */}
            {showSubscriptionModal && selectedPlan && !selectedPlan.isContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1A1B1E] rounded-2xl p-8 max-w-md w-full relative">
                        {/* Loader overlay */}
                        {subscriptionLoading && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 rounded-2xl">
                                <ButtonSpinner size={40} color="#f33d74" />
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-white mb-4">
                            Choose Billing Cycle
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Select how often you want to be billed and proceed to payment.
                        </p>
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleSubscriptionSelect("monthly")}
                                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-left flex justify-between items-center"
                                disabled={subscriptionLoading}
                            >
                                <span>Monthly</span>
                                <span className="font-bold">
                        ${Number(selectedPlan.monthly).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}/month
                    </span>
                            </button>
                            <button
                                onClick={() => handleSubscriptionSelect("quarterly")}
                                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-left flex justify-between items-center"
                                disabled={subscriptionLoading}
                            >
                                <span>Quarterly</span>
                                <span className="font-bold">
                        ${Number(selectedPlan.quarterly).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}/quarter
                        <span className="text-sm text-green-400 ml-2">
                            (Save 10%)
                        </span>
                    </span>
                            </button>
                            <button
                                onClick={() => handleSubscriptionSelect("yearly")}
                                className="w-full py-3 px-4 bg-[#f33d74] hover:bg-[#e63368] rounded-md text-white text-left flex justify-between items-center"
                                disabled={subscriptionLoading}
                            >
                                <span>Yearly</span>
                                <span className="font-bold">
                        ${Number(selectedPlan.yearly).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}/year
                        <span className="text-sm text-green-400 ml-2">
                            (Save 20%)
                        </span>
                    </span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowSubscriptionModal(false)}
                            className="w-full py-2 text-gray-400 hover:text-white"
                            disabled={subscriptionLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* -------- ACTIVE PLAN NOTIF -------- */}
            {authState === "authenticated" && currentPlan && isPlanActive && (
                <div className="fixed top-24 left-4 z-50 bg-green-500/95 text-white py-3 px-6 rounded-xl flex items-center gap-3 shadow-2xl border border-green-600 animate-fade-in-up">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                        <path d="M8 12.5l2.5 2L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                        <div className="font-bold">You have an active plan: <span className="underline">{planName}</span></div>
                        {expiredDateString && expiredDateString !== "-" && (
                            <div className="text-xs">Valid until: <span className="font-semibold">{expiredDateString}</span></div>
                        )}
                    </div>
                </div>
            )}

            {/* Pricing Section */}
            <section
                className="relative bg-[#0D0D10] py-20 overflow-hidden"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at top left, rgba(243, 61, 116, 0.3) 0%, rgba(13, 13, 16, 1) 40%)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Choose Your Scanning Plan
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Flexible pricing based on the number of domains you want to scan per month.
                        </p>
                    </div>
                    {plansLoading ? (
                        <div className="text-center text-gray-400">Loading plans...</div>
                    ) : plansError ? (
                        <div className="text-center text-red-400">{plansError}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.
                            filter(plan => !plan.isTest).map((plan, index) => {
                                const isCurrent = currentPlan && (
                                    (plan._id && plan._id === currentPlan.plan) ||
                                    (plan.domain && plan.domain === currentPlan.domain)
                                );
                                return (
                                    <div
                                        key={plan._id}
                                        className={`bg-[#1A1B1E] rounded-2xl p-8 text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] relative
                    ${plan.isPopular ? "ring-2 ring-[#f33d74]" : ""}
                    ${isCurrent ? "border-2 border-green-500" : ""}`}
                                    >
                                        {isCurrent && (
                                            <div
                                                className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                                CURRENT PLAN
                                            </div>
                                        )}
                                        {plan.isPopular && (
                                            <div
                                                className="bg-[#f33d74] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                                POPULAR
                                            </div>
                                        )}
                                        <h3 className="text-2xl font-bold mb-2">
                                            {plan.domain === "unlimited"
                                                ? "Unlimited Domains"
                                                : `${plan.domain} Domain${plan.domain === "1" ? "" : "s"}`}
                                        </h3>
                                        <p className="text-gray-400 mb-6">{plan.description}</p>
                                        <div className="mb-6">
                                            {plan.isContact ? (
                                                <span className="text-3xl font-bold text-[#f33d74]">
                                                    Contact Sales
                                                </span>
                                            ) : (
                                                <>
                                                    {formatPrice(plan.monthly, "month")}
                                                </>
                                            )}
                                        </div>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <svg
                                                        className="w-5 h-5 text-[#f33d74] mr-2 mt-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex gap-2">
                                            {plan.isContact ? (
                                                <a
                                                    href="/contact"
                                                    className="w-full block py-2 rounded-md font-medium bg-[#f33d74] hover:bg-[#e63368] text-center transition-colors duration-300 text-xs"
                                                >
                                                    Contact Sales
                                                </a>
                                            ) : authState === "authenticated" ? (
                                                isCurrent ? (
                                                    <button
                                                        className="w-full py-2 rounded-md font-medium bg-gray-600 cursor-not-allowed text-xs"
                                                        disabled
                                                    >
                                                        Current Plan
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePlanSelect(plan)}
                                                        className={`w-full py-2 rounded-md font-medium ${
                                                            plan.isPopular
                                                                ? "bg-[#f33d74] hover:bg-[#e63368]"
                                                                : "bg-gray-700 hover:bg-gray-600"
                                                        } transition-colors duration-300 text-xs`}
                                                    >
                                                        Upgrade Now
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handlePlanSelect(plan)}
                                                    className={`w-full py-2 rounded-md font-medium ${
                                                        plan.isPopular
                                                            ? "bg-[#f33d74] hover:bg-[#e63368]"
                                                            : "bg-gray-700 hover:bg-gray-600"
                                                    } transition-colors duration-300 text-xs`}
                                                >
                                                    {plan.isContact ? "Contact Sales" : "Get Started"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}