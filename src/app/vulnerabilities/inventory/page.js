"use client";
import { useEffect, useState } from "react";

export default function InventoryPage() {
    const [domains, setDomains] = useState([]);
    const [loadingDomains, setLoadingDomains] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [fetchError, setFetchError] = useState("");

    // Step 1: Fetch registered domains from /api/my-plan
    useEffect(() => {
        setLoadingDomains(true);
        fetch("/api/my-plan", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                const registered = Array.isArray(data.data?.registered_domain)
                    ? data.data.registered_domain
                    : [];
                setDomains(registered);
                setLoadingDomains(false);
            })
            .catch(() => {
                setDomains([]);
                setLoadingDomains(false);
                setFetchError("Failed to fetch registered domains");
            });
    }, []);

    // Step 2: Fetch inventory for registered domains
    useEffect(() => {
        if (!domains.length) return;
        setLoadingInventory(true);
        fetch(`/api/inventory?domains=${domains.join(",")}`)
            .then(res => res.json())
            .then(data => {
                setInventory(data.data || []);
                setLoadingInventory(false);
            })
            .catch(() => {
                setInventory([]);
                setLoadingInventory(false);
                setFetchError("Failed to fetch inventory data");
            });
    }, [domains]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#18181c] via-[#161622] to-[#18181c] text-white font-inter p-8">
            <h1 className="text-3xl font-bold mb-6">Inventory - Registered Domains</h1>
            {loadingDomains && <div>Loading registered domains...</div>}
            {fetchError && <div className="text-red-400 mb-4">{fetchError}</div>}
            {!loadingDomains && !domains.length && (
                <div className="text-pink-400">No registered domains found in your plan.</div>
            )}

            {domains.length > 0 && (
                <>
                    <div className="mb-4">
                        <span className="text-sm text-gray-400">Domains:</span>{" "}
                        <span className="text-pink-400">{domains.join(", ")}</span>
                    </div>
                    {loadingInventory ? (
                        <div>Loading inventory data...</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#232339] shadow-lg bg-[#161622]">
                            <table className="min-w-full text-white font-mono">
                                <thead>
                                <tr className="border-b border-[#232339] bg-[#191924]/90 text-xs text-gray-400">
                                    <th className="py-3 px-5 font-semibold text-left">Domain</th>
                                    <th className="py-3 px-5 font-semibold text-left">Host</th>
                                    <th className="py-3 px-5 font-semibold text-left">Port</th>
                                    <th className="py-3 px-5 font-semibold text-left">Status</th>
                                    <th className="py-3 px-5 font-semibold text-left">IP</th>
                                    <th className="py-3 px-5 font-semibold text-left">ASN</th>
                                    <th className="py-3 px-5 font-semibold text-left">Technologies</th>
                                    <th className="py-3 px-5 font-semibold text-left">Title</th>
                                    <th className="py-3 px-5 font-semibold text-left">Screenshot</th>
                                </tr>
                                </thead>
                                <tbody>
                                {inventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-400">
                                            No inventory data found.
                                        </td>
                                    </tr>
                                ) : (
                                    inventory.map(item => (
                                        <tr key={item.asset_hash}>
                                            <td className="py-3 px-5">{item._domain || item.domain_name}</td>
                                            <td className="py-3 px-5">{item.host}:{item.port}</td>
                                            <td className="py-3 px-5">{item.port}</td>
                                            <td className="py-3 px-5">
                          <span className={`rounded px-2 py-1 text-xs font-bold ${
                              item.status_code >= 200 && item.status_code < 300
                                  ? "bg-green-900 text-green-300"
                                  : item.status_code >= 400 && item.status_code < 500
                                      ? "bg-yellow-900 text-yellow-200"
                                      : item.status_code >= 500
                                          ? "bg-red-900 text-red-300"
                                          : "bg-gray-800 text-gray-400"
                          }`}>
                            {item.status_code}
                          </span>
                                            </td>
                                            <td className="py-3 px-5">{(item.ip || []).join(", ")}</td>
                                            <td className="py-3 px-5">{item.asn?.as_name || "-"}</td>
                                            <td className="py-3 px-5">
                                                {(item.technologies || []).map(tech => (
                                                    <span key={tech} className="inline-block bg-pink-900/60 text-pink-200 px-2 py-1 rounded mr-1 mb-1">{tech}</span>
                                                ))}
                                            </td>
                                            <td className="py-3 px-5">{item.title || "-"}</td>
                                            <td className="py-3 px-5">
                                                {item.screenshot_path
                                                    ? <img src={item.screenshot_path} alt="screenshot" className="w-20 rounded border border-gray-700" />
                                                    : <span className="text-gray-600">-</span>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}