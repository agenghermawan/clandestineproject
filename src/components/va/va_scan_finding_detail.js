import { useState, useEffect } from "react";
import { MdContentCopy, MdOpenInNew } from "react-icons/md";

function timeAgo(date) {
    if (!date) return "-";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

export default function ScanFindingDetail({ scanId, templateId }) {
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        fetch(`/api/va-scan-finding-detail?scan_id=${scanId}&templates=${templateId}&limit=20&offset=0&asset_metadata=true&vuln_status=open,triaged,fix_in_progress&severity=critical,high,medium,low,unknown`)
            .then(res => res.json())
            .then(data => {
                setDetail(data);
                setLoading(false);
            })
            .catch(e => {
                setError("Failed to load finding detail");
                setLoading(false);
            });
    }, [scanId, templateId]);

    if (loading) return (
        <div className="bg-[#161622] border-t border-[#232339] px-8 py-8 flex justify-center items-center text-gray-400">
            Loading...
        </div>
    );
    if (error) return (
        <div className="bg-[#161622] border-t border-[#232339] px-8 py-8 text-pink-400">
            {error}
        </div>
    );
    if (!detail?.data?.length) return (
        <div className="bg-[#161622] border-t border-[#232339] px-8 py-8 text-gray-400">
            No findings found for this template.
        </div>
    );

    // One finding = one template vulns, may have multiple assets/events
    const finding = detail.data[0];
    const asset = finding.asset_metadata || {};
    const event = (finding.event && finding.event[0]) || {};

    return (
        <div className="bg-[#161622] px-8 py-5">
            <div className="flex items-center gap-2 mb-4">
                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs bg-red-700 text-red-100`}>
                    {finding.severity?.charAt(0).toUpperCase() + finding.severity?.slice(1) || "Critical"}
                </span>
                <span className="font-bold text-white text-lg">{event.info?.name || finding.name}</span>
                <span className="text-xs font-bold ml-2 px-3 py-1 rounded-full bg-[#232339] text-gray-400">TEMPLATE</span>
                <span className="text-xs font-semibold ml-1 px-2 py-1 rounded bg-black/40 text-pink-300">{finding.template_id || finding.template}</span>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-gray-300 mb-4">
                <div><span className="font-bold">Asset:</span> {asset.domain_name || asset.host || finding.target}</div>
                <div><span className="font-bold">First seen:</span> {timeAgo(asset.created_at)}</div>
                <div><span className="font-bold">Last seen:</span> {timeAgo(asset.updated_at)}</div>
            </div>
            <div className="mb-2 text-gray-400">
                <span className="font-bold">Found at:</span>
                <span className="ml-2 flex items-center">
                    <button
                        className="mr-2"
                        title="Copy to clipboard"
                        onClick={() => navigator.clipboard.writeText(event["matched-at"] || finding.target)}
                    ><MdContentCopy /></button>
                    <a href={event["matched-at"] || finding.target} target="_blank" rel="noopener" className="hover:underline text-pink-400 flex items-center gap-1">
                        {event["matched-at"] || finding.target}
                        <MdOpenInNew />
                    </a>
                </span>
            </div>
            {/* Show more info, e.g. curl, request, response */}
            <div className="mt-4">
                <div className="font-bold text-gray-300 mb-1">cURL Command:</div>
                <pre className="bg-[#191924] text-xs rounded p-3 overflow-x-auto text-gray-200">
                    {event["curl-command"]}
                </pre>
            </div>
            <div className="mt-3">
                <div className="font-bold text-gray-300 mb-1">HTTP Request:</div>
                <pre className="bg-[#191924] text-xs rounded p-3 overflow-x-auto text-gray-200">
                    {event.request}
                </pre>
            </div>
            <div className="mt-3">
                <div className="font-bold text-gray-300 mb-1">HTTP Response:</div>
                <pre className="bg-[#191924] text-xs rounded p-3 overflow-x-auto text-gray-200">
                    {event.response}
                </pre>
            </div>
            <div className="mt-3">
                <div className="font-bold text-gray-300 mb-1">Description:</div>
                <pre className="bg-[#191924] text-xs rounded p-3 overflow-x-auto text-gray-200">
                    {event.info?.description}
                </pre>
            </div>
        </div>
    );
}