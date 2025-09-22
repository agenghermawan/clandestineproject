'use client';

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#181825] px-4">
            <div className="text-center">
                <svg width="96" height="96" viewBox="0 0 64 64" fill="none"
                     className="mx-auto mb-6 animate-fade-in">
                    <circle cx="32" cy="32" r="28" stroke="#0ff" strokeWidth="3" opacity="0.7"/>
                    <path d="M18 32c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14" stroke="#f03262" strokeWidth="2"
                          fill="none"/>
                    <path d="M32 46c-7.732 0-14-6.268-14-14" stroke="#6b21a8" strokeWidth="2" fill="none"/>
                    <text x="32" y="38" textAnchor="middle" fontSize="24" fill="#fff" fontWeight="bold" opacity="0.9">404</text>
                    <style jsx>{`
                        .animate-fade-in {
                            animation: fadeIn .8s;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(.95);}
                            to { opacity: 1; transform: scale(1);}
                        }
                    `}</style>
                </svg>
                <h1 className="text-4xl font-extrabold text-white mb-2">Page Not Found</h1>
                <p className="text-lg text-gray-400 mb-6">
                    We couldn't find the page you were looking for.<br />
                    Maybe it's been moved or no longer exists.
                </p>
                <Link href="/" legacyBehavior>
                    <a className="inline-block bg-gradient-to-r from-[#0ff] via-[#f03262] to-[#6b21a8] text-white px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition text-lg">
                        Go Back Home
                    </a>
                </Link>
            </div>
        </div>
    );
}