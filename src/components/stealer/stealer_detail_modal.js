"use client";
import React from "react";

export default function StealerDetailModal({show, onClose, entry}) {
    if (!show || !entry) return null;

    // List of fields for detail view
    const fields = [
        { label: "Email/Username", value: entry.email, highlight: true },
        { label: "Password", value: entry.password, highlight: true },
        { label: "Domain", value: entry.origin },
        { label: "Intel Source", value: entry.source },
        { label: "Last Seen in Dump", value: entry.lastBreach },
        { label: "Checksum", value: entry.checksum },
        { label: "Valid Status", value: entry.valid === true ? "Valid" : entry.valid === false ? "Not Valid" : "Unknown" },
        { label: "ID", value: entry.id }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
            <div className="relative bg-gradient-to-br from-[#191922] via-[#232339] to-[#191922] rounded-3xl shadow-2xl p-8 w-full max-w-[70%] border border-[#282838] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close"
                >×</button>
                <div className="mb-6 flex justify-center">
                    <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="22" stroke="#f03262" strokeWidth="3" fill="#18181c"/>
                        <path d="M24 14v12l7 5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="24" cy="24" r="18" stroke="#fff" strokeDasharray="2 6" opacity="0.15"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center text-[#f03262]">Credential Detail</h2>
                <div className="space-y-4">
                    {fields.map(({label, value, highlight}) =>
                        <div key={label} className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
                            <span className={`font-mono ${highlight ? "text-lg text-pink-300 break-all" : "text-base text-white"}`}>
                                {value ?? <span className="italic text-gray-500">N/A</span>}
                            </span>
                        </div>
                    )}
                </div>
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="inline-block mt-2 bg-[#f03262] hover:bg-[#c91d4e] text-white font-semibold px-6 py-2 rounded-lg transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}