import dynamic from "next/dynamic";
import {
    MdCheckCircle,
    MdCancel,
    MdFilterList,
    MdNumbers
} from "react-icons/md";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function statsIcon(bgFrom, bgTo, jsxIcon) {
    return (
        <div className={`bg-gradient-to-br from-${bgFrom} to-${bgTo} rounded-full p-2 text-white`}>
            {jsxIcon}
        </div>
    );
}

export default function StealerStatisticsWithChart({ total, filtered, valid, notValid }) {
    // Chart: 1 series, xaxis 4 kategori
    const chartOptions = {
        chart: {
            id: "stealer-area",
            type: "area",
            toolbar: { show: false },
            height: 350
        },
        theme: { mode: "dark" },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2 } },
        xaxis: {
            categories: ["Valid", "Not Valid", "Filtered", "Total"],
            labels: { style: { colors: "#aaa" } }
        },
        yaxis: { labels: { style: { colors: "#aaa" } }, min: 0 },
        grid: { borderColor: "#232339" },
        tooltip: { theme: "dark" }
    };

    // Satu baris untuk tiap nilai statistik
    const chartSeries = [{
        name: "Statistics",
        data: [valid, notValid, filtered, total]
    }];

    return (
        <div className="mb-6">
            {/* Statistik Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("green-500", "green-700", (
                        <MdCheckCircle size={28} />
                    ))}
                    <div>
                        <div className="text-lg font-bold text-white">{valid}</div>
                        <div className="text-xs text-gray-400">Valid</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("red-500", "red-700", (
                        <MdCancel size={28} />
                    ))}
                    <div>
                        <div className="text-lg font-bold text-white">{notValid}</div>
                        <div className="text-xs text-gray-400">Not Valid</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("blue-400", "cyan-800", (
                        <MdFilterList size={28} />
                    ))}
                    <div>
                        <div className="text-lg font-bold text-white">{filtered}</div>
                        <div className="text-xs text-gray-400">Filtered/Displayed</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("cyan-400", "fuchsia-500", (
                        <MdNumbers size={28} />
                    ))}
                    <div>
                        <div className="text-lg font-bold text-white">{total}</div>
                        <div className="text-xs text-gray-400">Total Entries</div>
                    </div>
                </div>
            </div>
            {/* Area Chart */}
            <div className="bg-[#18181C] border border-[#26263a] rounded-2xl shadow-xl p-4 md:p-6">
                <div className="mb-2 text-white font-semibold">Credential Exposure Statistics</div>
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height={350}
                />
            </div>
        </div>
    );
}