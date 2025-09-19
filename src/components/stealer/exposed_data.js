import { useState, useRef, useLayoutEffect } from "react";

function ExposedData({ entry }) {
    const [copied, setCopied] = useState("");

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(""), 1200);
    };

    return (
        <td className="py-4 px-6 max-w-[320px] min-w-[240px] whitespace-normal break-all">
            <div className="space-y-2">
                {/* Identity */}
                <div
                    className="flex items-center cursor-pointer group relative"
                    title="Click to copy identity"
                    onClick={() => handleCopy(entry.email, "identity")}
                >
                    <span className="text-xs bg-gradient-to-r from-green-600 to-green-800 px-2 py-1 rounded mr-2">
                        📧 identity
                    </span>
                    <span className="group-hover:text-green-300 transition-colors break-all">
                        {entry.email}
                    </span>
                    {copied === "identity" && (
                        <span
                            className="absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 text-xs bg-black/80 text-white rounded shadow-lg z-10 animate-fade-in-up">
                            Copied!
                        </span>
                    )}
                </div>
                {/* Password */}
                <div
                    className="flex items-center cursor-pointer group relative"
                    title="Click to copy password"
                    onClick={() => handleCopy(entry.password, "password")}
                >
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-purple-800 px-2 py-1 rounded mr-2">
                        🗝️ pass
                    </span>
                    <span className="group-hover:text-purple-300 transition-colors break-all">
                        {entry.password}
                    </span>
                    {copied === "password" && (
                        <span
                            className="absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 text-xs bg-black/80 text-white rounded shadow-lg z-10 animate-fade-in-up">
                            Copied!
                        </span>
                    )}
                </div>
                {/* Origin */}
                <OriginCell origin={entry.origin} />
            </div>
        </td>
    );
}

function OriginCell({ origin }) {
    const [isHover, setIsHover] = useState(false);
    const [showAbove, setShowAbove] = useState(false);
    const cellRef = useRef(null);

    // Ambil domain pertama saja buat href (jika lebih dari satu, pakai pertama)
    let first = "";
    if (origin) {
        first = origin.split(",")[0]?.trim() ?? "";
    }
    let href = first;
    if (href && !/^https?:\/\//i.test(href)) href = "https://" + href;

    // Detect if tooltip at bottom would overflow, show above if necessary
    useLayoutEffect(() => {
        if (!isHover) return;
        const el = cellRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const tooltipHeight = 56; // approx min height px, you can adjust as needed
        const margin = 12;
        if (window.innerHeight - rect.bottom < tooltipHeight + margin) {
            setShowAbove(true);
        } else {
            setShowAbove(false);
        }
    }, [isHover]);

    return (
        <div
            className="flex items-center group relative"
            ref={cellRef}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            <span className="text-xs bg-gradient-to-r from-blue-600 to-blue-800 px-2 py-1 rounded mr-2">
                🌐 origin
            </span>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:text-blue-300 underline transition-colors break-all relative max-w-[600px] whitespace-nowrap overflow-hidden text-ellipsis block"
                title={origin}
                onClick={e => { e.stopPropagation(); }}
            >
                <DomainList domainsString={origin} limit={3} />
            </a>
            {/* Tooltip on hover */}
            {(isHover && !!origin) && (
                <span
                    className={
                        "absolute left-0 z-30 bg-[#232339] text-white px-3 py-2 rounded shadow-xl min-w-[220px] max-w-[600px] break-words text-xs border border-blue-500 animate-fade-in-up select-text"
                        + (showAbove ? " mb-2 bottom-full" : " mt-2 top-full")
                    }
                    style={{whiteSpace:"pre-line"}}
                    onClick={e => e.stopPropagation()}
                >
                    {origin}
                </span>
            )}
        </div>
    );
}

const DomainList = ({ domainsString, limit = 3 }) => {
    const domains = domainsString
        ? domainsString.split(",").map((d) => d.trim()).filter(Boolean)
        : [];
    const [showAll, setShowAll] = useState(false);

    if (domains.length === 0) return <span>-</span>;

    const shown = domains.slice(0, limit).join(", ");
    const needEllipsis = domains.length > limit;

    return (
        <span>
            {showAll
                ? domains.join(", ")
                : (
                    <>
                        <span
                            style={{
                                maxWidth: 600,
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                verticalAlign: "bottom"
                            }}
                            title={domains.join(", ")}
                        >
                            {shown}
                            {needEllipsis && " ..."}
                        </span>
                    </>
                )
            }
            {needEllipsis && (
                <button
                    onClick={e => {
                        e.stopPropagation();
                        setShowAll((prev) => !prev);
                    }}
                    className="ml-2 text-blue-400 hover:underline focus:outline-none text-xs"
                >
                    {showAll ? "Read Less" : "Read More"}
                </button>
            )}
        </span>
    );
};

export default ExposedData;
