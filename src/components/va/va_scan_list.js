import React, { useEffect, useState } from "react";

export default function ScanHistoryTable() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/va-scan-list?page=${page}&size=${size}`)
            .then(res => res.json())
            .then(data => {
                setScans(data.scans || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(e => {
                setError("Failed to load scan history");
                setLoading(false);
            });
    }, [page, size]);

    if (loading) return <div className="text-white p-8">Loading scan history...</div>;
    if (error) return <div className="text-red-400 p-8">{error}</div>;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Scan History</h2>
            <table className="min-w-full bg-[#191924] text-white rounded-lg overflow-hidden shadow-lg">
                <thead>
                <tr className="bg-[#232339]">
                    <th className="py-3 px-4 text-left">Scan Name</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Severity</th>
                    <th className="py-3 px-4 text-left">Templates</th>
                    <th className="py-3 px-4 text-left">Services</th>
                    <th className="py-3 px-4 text-left">Duration</th>
                    <th className="py-3 px-4 text-left">Last Updated</th>
                </tr>
                </thead>
                <tbody>
                {scans.map(scan => (
                    <tr key={scan.id} className="border-b border-[#232339] hover:bg-[#232339]">
                        <td className="py-2 px-4">{scan.name}</td>
                        <td className="py-2 px-4">{scan.status}</td>
                        <td className="py-2 px-4">
                            {scan.severity_breakdown
                                ? Object.entries(scan.severity_breakdown).map(([sev, count]) =>
                                    <span key={sev} className="inline-block mr-1 px-2 py-1 rounded bg-[#222] text-xs">{sev}: {count}</span>
                                )
                                : "-"}
                        </td>
                        <td className="py-2 px-4">{scan.templates} templates</td>
                        <td className="py-2 px-4">{scan.services} services</td>
                        <td className="py-2 px-4">{scan.duration}</td>
                        <td className="py-2 px-4">{scan.updated_at ? new Date(scan.updated_at).toLocaleString() : ""}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 bg-[#232339] text-white rounded disabled:opacity-50"
                >Prev</button>
                <span className="text-gray-300">Page {page} of {Math.ceil(total/size)}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total/size)}
                    className="px-3 py-2 bg-[#232339] text-white rounded disabled:opacity-50"
                >Next</button>
            </div>
        </div>
    );
}