import ExcelJS from "exceljs";

export function StealerExportButton({ lastQuery, fetchAllStealerData, loading, onStart, onFinish }) {
    const handleExportExcel = async () => {
        if (!fetchAllStealerData) {
            alert("Export function not available");
            return;
        }
        try {
            if (onStart) onStart();
            const allRawData = await fetchAllStealerData(lastQuery);

            if (!allRawData.length) {
                alert("No data to export!");
                if (onFinish) onFinish();
                return;
            }

            const allData = allRawData.map((item, idx) => ({
                no: idx + 1,
                email: item._source?.username || "",
                password: item._source?.password || "",
                origin: item._source?.domain || "",
                source: item._source?.threatintel || "",
                valid: typeof item._source?.valid === "boolean" ? (item._source?.valid ? "Valid" : "Not Valid") : "",
                checksum: item._source?.Checksum || "",
            }));

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Stealer Logs");
            worksheet.columns = [
                { header: "No", key: "no", width: 6 },
                { header: "Email / Username", key: "email", width: 32 },
                { header: "Password", key: "password", width: 20 },
                { header: "Domain", key: "origin", width: 40 },
                { header: "Intel Source", key: "source", width: 18 },
                { header: "Valid", key: "valid", width: 12 },
                { header: "Checksum", key: "checksum", width: 38 },
            ];
            allData.forEach(row => worksheet.addRow(row));
            worksheet.getRow(1).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `stealer-export.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Export failed: " + err.message);
        } finally {
            if (onFinish) onFinish();
        }
    };

    return (
        <button
            onClick={handleExportExcel}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-700 to-pink-500 hover:from-pink-600 hover:to-pink-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {loading ? "Exporting..." : "Download All Extract Logs (Excel)"}
        </button>
    );
}