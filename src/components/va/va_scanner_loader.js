import React from "react";

export default function VAScannerLoader({ status = "Initializing", domain, message, from_leaks  }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
            <svg className="mb-6 animate-pulse" width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="#18181c" stroke="#f03262" strokeWidth="8" />
                <circle cx="40" cy="40" r="20" fill="#232339" stroke="#f03262" strokeWidth="4" />
                <circle className="animate-ping" cx="40" cy="40" r="36" fill="none" stroke="#f03262" strokeWidth="2" />
            </svg>
            <div className="text-2xl font-bold text-pink-400 tracking-wide animate-pulse mb-2">
                {status}
            </div>
            <div className="text-gray-300 text-sm mb-1">
                {domain && (
                    from_leaks ? `Keyword: ${domain}` : `Domain: ${domain}`
                )}
            </div>
            <div className="text-gray-500 text-xs">
                { message == null ? 'This may take up to 1-2 minutes. Please keep this window open...' : message}
            </div>
        </div>
    );
}