import React from "react";

// Recursive value renderer
function renderValue(value, level = 0) {
    if (value === null || value === undefined) {
        return <span className="text-gray-400 italic">N/A</span>;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400 italic">[empty]</span>;
        // Tampilkan semua isi array sebagai block info, tidak sebagai tabel!
        return (
            <div className={`space-y-2 pl-${Math.min(level * 2, 8)}`}>
                {value.map((item, idx) => (
                    <div key={idx} className="mb-2">
                        <DynamicProfileInfo data={item} level={level + 1} />
                    </div>
                ))}
            </div>
        );
    }
    if (typeof value === "object") {
        return <DynamicProfileInfo data={value} level={level + 1} />;
    }
    return <span>{String(value)}</span>;
}

  function DynamicProfileInfo({ data, level = 0, previewCount = 3 }) {
    const [showAll, setShowAll] = React.useState(false);

    if (!data || typeof data !== "object") return null;

    // Jika array, tampilkan setiap item array sebagai info block tanpa key angka
    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-gray-400 italic">No Data</span>;
        return (
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className={`rounded ${level ? "bg-[#191b20]/60 p-3" : ""}`}>
                        <DynamicProfileInfo data={item} level={level} />
                    </div>
                ))}
            </div>
        );
    }

    // Untuk object (biasa)
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="text-gray-400 italic">No Data</span>;
    const toShow = (level === 0 && !showAll) ? entries.slice(0, previewCount) : entries;

    return (
        <div className={`text-xs ${level ? "space-y-2" : "space-y-2"}`}>
            {toShow.map(([key, value]) => (
                <div key={key} className="flex items-start">
                    <div
                        className={`min-w-[80px] font-semibold text-gray-400 ${
                            level ? "pr-2" : "pr-4"
                        } text-left`}
                    >
                        {key}
                    </div>
                    <div className="text-gray-100 break-all">{renderValue(value, level)}</div>
                </div>
            ))}
            {level === 0 && entries.length > previewCount && (
                <button
                    type="button"
                    onClick={() => setShowAll(s => !s)}
                    className="text-blue-400 text-xs mt-1 hover:underline focus:outline-none"
                >
                    {showAll ? "Read Less" : "Read More"}
                </button>
            )}
        </div>
    );
}

// CARD UTAMA
export default function LeakCardDynamic({ entry }) {
    // Tampilkan summary utama dan data penting
    return (
        <div className="bg-[#181820] rounded-xl shadow-lg p-6 flex flex-col gap-3 border border-[#262630] min-w-0">
            {/* Header */}
            <h3 className="text-lg font-bold text-white mb-1">{entry.source || "Unknown Source"}</h3>
            {entry.summary && (
                <p className="text-gray-400 text-xs mb-2">{entry.summary}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs mb-2">
                {entry.severity && (
                    <span className={
                        "px-2 py-1 rounded font-bold " +
                        (entry.severity === "Critical" ? "bg-red-700 text-red-100" :
                            entry.severity === "High" ? "bg-orange-700 text-orange-100" :
                                entry.severity === "Medium" ? "bg-yellow-700 text-yellow-100" :
                                    "bg-green-700 text-green-100")
                    }>
                        {entry.severity}
                    </span>
                )}
                {entry.breachDate && (
                    <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">
                        {entry.breachDate}
                    </span>
                )}
                {entry.records && (
                    <span className="px-2 py-1 rounded bg-gray-700 text-gray-300">
                        {entry.records}
                    </span>
                )}
            </div>
            {/* Info penting yang flat */}
            <div className="flex flex-col gap-1 text-xs mb-2">
                <div><span className="font-semibold text-gray-400">Email:</span> <span className="text-gray-100">{entry.email}</span></div>
                <div><span className="font-semibold text-gray-400">Password:</span> <span className="text-gray-100">{entry.passwordExposed}</span></div>
                {entry.position && <div><span className="font-semibold text-gray-400">Position:</span> <span className="text-gray-100">{entry.position}</span></div>}
                {entry.company && <div><span className="font-semibold text-gray-400">Company:</span> <span className="text-gray-100">{entry.company}</span></div>}
                {entry.location && <div><span className="font-semibold text-gray-400">Location:</span> <span className="text-gray-100">{entry.location}</span></div>}
            </div>
            <hr className="border-[#23232c] my-1" />
            {/* Data mentah, sangat dinamis */}
            {entry.rawData && (
                <div>
                    <div className="text-xs text-cyan-500 mb-1 font-semibold">Raw Data:</div>
                    <DynamicProfileInfo data={entry.rawData} />
                </div>
            )}
        </div>
    );
}