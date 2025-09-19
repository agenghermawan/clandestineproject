import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function StealerAdvancedSearchModal({
                                                       open,
                                                       onClose,
                                                       onSearch,
                                                       defaultQ = "",
                                                       defaultDomain = "",
                                                       defaultUsername = "",
                                                       defaultPassword = "",
                                                       isLoading,
                                                   }) {
    const [q, setQ] = useState(defaultQ);
    const [domain, setDomain] = useState(defaultDomain);
    const [username, setUsername] = useState(defaultUsername);
    const [password, setPassword] = useState(defaultPassword);

    useEffect(() => {
        if (open) {
            setQ(defaultQ);
            setDomain(defaultDomain);
            setUsername(defaultUsername);
            setPassword(defaultPassword);
        }
    }, [open, defaultQ, defaultDomain, defaultUsername, defaultPassword]);


    const handleSubmit = (e) => {
        e.preventDefault();
        const params = {};
        if (q.trim()) params.q = q.trim();
        if (domain.trim()) params.domain = domain.trim();
        if (username.trim()) params.username = username.trim();
        if (password.trim()) params.password = password.trim();
        onSearch(params);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-[#181820] w-6/12 rounded-xl shadow-2xl p-8 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition"
                >
                    <XMarkIcon className="w-6 h-6 text-white" />
                </button>
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                    Advanced Stealer Search
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Search by All (simple input) */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Search by All
                        </label>
                        <input
                            type="text"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search in all fields"
                            className="w-full px-4 py-2 rounded-lg bg-[#23232c] text-white border border-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Stealer by Domain */}
                    <div className="flex items-center gap-2">
            <span className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-l-2xl text-sm font-semibold text-left">
              Stealer by Domain
            </span>
                        <input
                            type="text"
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                            placeholder="Enter domain"
                            className="flex-1 px-3 py-2 rounded-r-2xl bg-[#23232c] text-white border border-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Stealer by Username */}
                    <div className="flex items-center gap-2">
            <span className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-l-2xl text-sm font-semibold text-left">
              Stealer by Username
            </span>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="flex-1 px-3 py-2 rounded-r-2xl bg-[#23232c] text-white border border-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Stealer by Password */}
                    <div className="flex items-center gap-2">
            <span className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-l-2xl text-sm font-semibold text-left">
              Stealer by Password
            </span>
                        <input
                            type="text"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="flex-1 px-3 py-2 rounded-r-2xl bg-[#23232c] text-white border border-blue-400 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-3 mx-auto px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                    >
                        {isLoading ? "Searching..." : "Find"}
                    </button>
                </form>
            </div>
        </div>
    );
}