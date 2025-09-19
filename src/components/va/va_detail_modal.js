import React, { useState } from "react";

// Utility: format "ago"
function formatAgo(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    if (isNaN(diffMs)) return "-";
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMo = Math.floor(diffDay / 30);
    return `${diffMo}mo ago`;
}

function AssetDetailModal({ open, onClose, item }) {
    const [showJson, setShowJson] = useState(true);

    if (!open || !item) return null;

    const asset = item.asset_metadata || {};
    const event = Array.isArray(item.event) ? item.event[0] : (item.event || {});
    const info = event.info || {};
    const classification = info.classification || {};

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30">
            <div
                className="w-full max-w-md h-[100vh] rounded-xl overflow-hidden bg-[#19191e] shadow-2xl border border-[#232339] flex flex-col animate-fade-in"
                style={{ minWidth: 520 }}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#232339] bg-[#18181d]/95">
                    <div className="flex flex-col gap-1 w-3/4 truncate">
                        <div className="text-base font-semibold text-white leading-tight truncate">
                            {info.name || asset.title || asset.host}
                        </div>
                        <div className="flex gap-2 items-center">
                            {classification["cve-id"]?.[0] && (
                                <span className="bg-pink-900/40 px-2 py-0.5 rounded text-xs font-mono text-pink-300">{classification["cve-id"]?.[0]}</span>
                            )}
                            {(item.template_id || item["template-id"]) && (
                                <span className="bg-[#23232b] px-2 py-0.5 rounded text-xs font-mono text-gray-300">
                                    {item.template_id || item["template-id"]}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        className="rounded px-2 py-1 text-gray-400 hover:text-red-300 text-2xl"
                        onClick={onClose}
                        aria-label="Close"
                    >×
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="bg-[#23232b] px-3 py-1 rounded text-xs text-gray-300 font-semibold">Retest</button>
                        <span className="bg-[#23232b] px-3 py-1 rounded text-xs text-gray-300 font-semibold">Open</span>
                        <span className="bg-[#23232b] px-3 py-1 rounded text-xs text-gray-300 font-semibold">Ticket</span>
                        <button className="ml-auto bg-[red] px-3 py-1 rounded text-xs text-gray-300 font-semibold"
                                onClick={() => setShowJson(j => !j)}
                        >{showJson ? "Hide JSON" : "Full JSON"}</button>
                    </div>

                    {/* Main fields */}
                    <div className="space-y-2">
                        {info.description && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Description</div>
                                <p className="text-gray-200 text-sm">{info.description}</p>
                            </div>
                        )}
                        {info.remediation && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Remediation</div>
                                <div className="text-gray-200 text-sm">{info.remediation}</div>
                            </div>
                        )}
                        {info.reference && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Reference</div>
                                <div className="flex flex-col gap-1 text-sm">
                                    {info.reference.map((url, i) =>
                                        <a key={url + i} href={url} className="text-blue-400 underline" target="_blank" rel="noopener">{url}</a>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Asset/Event Info */}
                        <div className="grid grid-cols-1 gap-1 border-t border-[#232339] pt-4">
                            <InfoField label="First seen" value={formatAgo(asset.created_at || item.created_at)} />
                            <InfoField label="Last seen" value={formatAgo(asset.updated_at || item.updated_at)} />
                            <InfoField label="Host" value={asset.host} />
                            <InfoField label="IP address" value={Array.isArray(asset.ip) ? asset.ip.join(", ") : asset.ip} />
                            <InfoField label="Template ID" value={item.template_id || item["template-id"]} />
                            <InfoField label="Vuln ID" value={item.vuln_id} />
                            <InfoField label="Scan ID" value={item.scan_id} />
                            <InfoField label="Asset Group" value={asset.enumeration_name} />
                            <InfoField label="CVSS" value={classification["cvss-score"]} />
                            <InfoField label="CWE" value={Array.isArray(classification["cwe-id"]) ? classification["cwe-id"].join(", ") : classification["cwe-id"]} />
                            <InfoField label="Vendor" value={info.metadata?.vendor} />
                            <InfoField label="Product" value={info.metadata?.product} />
                            <InfoField label="Protocol" value={event.type || asset.webserver} />
                        </div>
                        {/* Found At */}
                        {event["matched-at"] && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Found at</div>
                                <div className="bg-[#23232b] p-2 rounded text-xs font-mono text-gray-200 overflow-x-auto">{event["matched-at"]}</div>
                            </div>
                        )}
                        {/* Extracted */}
                        {event["extracted-results"] && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Extracted</div>
                                <div className="bg-[#23232b] p-2 rounded text-xs text-gray-200">
                                    {event["extracted-results"].join(", ")}
                                </div>
                            </div>
                        )}
                        {/* Request/Response */}
                        {event.request && (
                            <div>
                                <div className="font-semibold text-gray-300 mb-1">Request</div>
                                <div className="bg-[#23232b] p-2 rounded text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre">{event.request}</div>
                            </div>
                        )}
                    </div>

                    {/* JSON Section */}
                    {showJson && (
                        <div className="relative">
                            <button
                                className="absolute top-2 right-2 text-xs text-blue-400 underline"
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
                                }}
                            >copy</button>
                            <pre className="bg-[#121217] p-2 rounded text-xs text-gray-200 overflow-x-auto max-h-[40vh] whitespace-pre-wrap">
                                {JSON.stringify(item, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper for field rendering
function InfoField({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-2 py-0.5 text-xs">
            <span className="min-w-[84px] text-gray-400">{label}</span>
            <span className="flex-1 break-all text-gray-100">{value}</span>
        </div>
    );
}

export default AssetDetailModal;