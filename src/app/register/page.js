"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {FaExclamationTriangle, FaCopy, FaDownload, FaLock} from "react-icons/fa";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "react-qr-code";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
    const router = useRouter();
    const [referral, setReferral] = useState("");
    const [showReferral, setShowReferral] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [accessId, setAccessId] = useState("");
    const [provisionUrl, setProvisionUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [hasStored, setHasStored] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");

    // Modal close handler (optional, for UX)
    const closeModal = () => {
        setModalOpen(false);
        setAccessId("");
        setProvisionUrl("");
        setSecret("");
        setHasStored(false);
        setRecaptchaToken("");
    };

    // Copy to clipboard
    const handleCopy = (val) => {
        navigator.clipboard.writeText(val);
        toast.success("Copied to clipboard", {autoClose: 1500});
    };

    // Download as txt
    const handleDownload = () => {
        const blob = new Blob([accessId], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "access_id.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Extract secret from provision_url
    function extractSecretFromProvisionUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.searchParams.get("secret") || "";
        } catch {
            return "";
        }
    }

    // Register handler
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            toast.error("Please complete the captcha");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (res.ok && data.access_id) {
                setAccessId(data.access_id);
                setProvisionUrl(data.provision_url || "");
                setSecret(extractSecretFromProvisionUrl(data.provision_url || ""));
                setModalOpen(true);
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    // Modal: Continue
    const handleContinue = () => {
        if (!hasStored) {
            toast.error("Please confirm you have safely stored your access ID.");
            return;
        }
        setModalOpen(false);
        router.push("/login");
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
            {/* Background Glow */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
            {/* Register Card */}
            <div
                className="w-full max-w-lg relative p-8 rounded-xl bg-gray-900/90 backdrop-blur-lg border border-gray-800 shadow-2xl z-10">
                <Link href={"/"} className="flex flex-col items-center">
                    <Image
                        src="/image/logo.png"
                        alt="logo"
                        width={300}
                        height={40}
                        className="invert"
                        priority
                    />
                </Link>
                <br/>
                <br/>
                <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-500 to-green-400 bg-clip-text text-transparent">
                    Create Account
                </h1>
                <p className="text-center text-gray-400 mb-6">
                    Get your unique access ID for Clandestine Project.
                </p>
                {/* Important Info */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6 border-l-4 border-yellow-400">
                    <div className="flex items-center mb-2 text-yellow-400">
                        <FaExclamationTriangle className="mr-2"/>
                        <span className="font-semibold">Important Information</span>
                    </div>
                    <ul className="text-sm text-gray-200 space-y-1 pl-6 list-disc">
                        <li>You will receive a unique 18-character ID</li>
                        <li>This ID will be your only way to access your account</li>
                        <li>There is no password reset option</li>
                        <li>Keep your ID in a secure location</li>
                        <li>Lost IDs cannot be recovered</li>
                    </ul>
                </div>
                {/* Referral */}
                <form onSubmit={handleRegister}>
                    {/* Google reCAPTCHA */}
                    <div className="mb-4 flex justify-center">
                        <ReCAPTCHA
                            sitekey="6Lcvh3ErAAAAAA1clQ_IFIvC8l4aZro2poENUncA"
                            onChange={setRecaptchaToken}
                            theme="dark"
                        />
                    </div>
                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading || !recaptchaToken}
                        className={`w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${loading || !recaptchaToken ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        <FaLock className="mr-2"/>
                        {loading ? "Registering..." : "Generate Access ID"}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an ID?{" "}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div
                        className="relative bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                        {/* Modal Header */}
                        <button onClick={closeModal}
                                className="absolute right-4 top-4 text-gray-500 hover:text-gray-200 text-xl">&times;</button>
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Your Access ID</h2>
                        {/* Access ID */}
                        <div className="flex items-center bg-black/80 rounded-lg px-4 py-4 mb-4 border border-gray-700">
                            <span className="text-lg font-mono break-all flex-1 text-white select-all">{accessId}</span>
                            <button
                                onClick={() => handleCopy(accessId)}
                                className="ml-3 px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                                title="Copy"
                            >
                                <FaCopy/>
                            </button>
                        </div>
                        <button
                            className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white rounded-lg px-4 py-2 font-semibold mb-4 transition"
                            onClick={handleDownload}
                        >
                            <FaDownload/> Download ID
                        </button>
                        {/* TOTP QR + Secret */}
                        {provisionUrl && (
                            <div className="mb-4">
                                <div className="mb-2 font-semibold text-white text-center">
                                    Scan this QR in your Authenticator App
                                </div>
                                {/* PATCH: QR code dengan background putih dan border-radius */}
                                <div className="flex justify-center mb-2">
                                    <div style={{
                                        background: "#fff",
                                        borderRadius: 12,
                                        padding: 16,
                                        display: "inline-block",
                                    }}>
                                        <QRCode value={provisionUrl} size={180} fgColor="#000" bgColor="#fff" />
                                    </div>
                                </div>
                                <div
                                    className="flex items-center justify-center bg-gray-800 rounded px-3 py-2 mx-auto w-fit">
                                    <span className="font-mono text-yellow-300">{secret}</span>
                                    <button
                                        onClick={() => handleCopy(secret)}
                                        className="ml-2 px-1 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition text-sm"
                                        title="Copy secret"
                                    >
                                        <FaCopy/>
                                    </button>
                                </div>
                                <div className="text-center text-xs text-gray-400 mt-1">
                                    Or enter secret manually in your authenticator app
                                </div>
                            </div>
                        )}
                        <div className="bg-red-900/80 border border-red-700 rounded-lg p-4 mb-4 flex items-start gap-3">
                            <FaExclamationTriangle className="mt-1 text-xl text-yellow-400"/>
                            <div>
                                <div className="font-semibold text-red-200">Save this ID immediately!</div>
                                <div className="text-xs text-red-100 mt-1">
                                    This is your only chance to save this ID. You won't be able to recover it if lost.
                                </div>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 mb-4 text-gray-300 text-sm">
                            <input
                                type="checkbox"
                                checked={hasStored}
                                onChange={e => setHasStored(e.target.checked)}
                                className="accent-red-500"
                            />
                            I have safely stored my access ID
                        </label>
                        <button
                            className={`w-full py-3 rounded-lg font-bold text-white transition ${hasStored ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 cursor-not-allowed"}`}
                            onClick={handleContinue}
                            disabled={!hasStored}
                        >
                            Continue to Platform
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}