"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Link from "next/link";
import {useAuth} from "../../context/AuthContext";


export default function LoginPage() {
    const [accessId, setAccessId] = useState("");
    const [totp, setTotp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {login} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    access_id: accessId,
                    totp: totp,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data); // <-- update context!

                toast.success("Login Successful!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setTimeout(() => {
                    router.push("/");
                }, 500);
            } else {
                setError(data.message || "Something went wrong!");
                setLoading(false); // stop loading on error
            }
        } catch (err) {
            setError("Network error!");
            setLoading(false); // stop loading on error
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Glowing Background Effect */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
            {/* Login Card */}
            <div
                className="w-full max-w-md relative p-8 rounded-xl bg-gray-900/90 backdrop-blur-lg border border-gray-800 shadow-2xl overflow-hidden">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-green-400 bg-clip-text text-transparent">
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
                </h1>
                {/* Form Login */}
                <form onSubmit={handleSubmit}>
                    {/* Access ID */}
                    <div className="mb-6">
                        <label htmlFor="accessid" className="block mb-2 text-sm text-gray-400">
                            Access ID
                        </label>
                        <input
                            type="text"
                            id="accessid"
                            placeholder="Your Access ID"
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10 font-mono"
                            required
                            value={accessId}
                            disabled={loading}
                            onChange={(e) => setAccessId(e.target.value)}
                        />
                    </div>
                    {/* TOTP */}
                    <div className="mb-6">
                        <label htmlFor="totp" className="block mb-2 text-sm text-gray-400">
                            Authenticator Code (TOTP)
                        </label>
                        <input
                            type="text"
                            id="totp"
                            placeholder="6-digit code"
                            maxLength={6}
                            pattern="\d{6}"
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10 font-mono tracking-widest"
                            required
                            value={totp}
                            disabled={loading}
                            onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>
                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm mb-4 text-center animate-shake">
                            {error}
                        </p>
                    )}
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold transition-all transform ${loading
                            ? "bg-gray-700 cursor-not-allowed opacity-70"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 active:scale-95"
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
                {/* Register menu */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    Don't have an access ID?{" "}
                    <Link href="/register"
                          className="text-purple-400 hover:text-purple-300 underline font-semibold transition-colors">
                        Get Started
                    </Link>
                </div>
                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    &copy;  2025 Clandestine Project. All rights reserved
                </p>
            </div>
        </div>
    );
}