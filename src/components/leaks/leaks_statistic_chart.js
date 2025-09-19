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

export default function LeaksStatisticsWithChart({ total, filtered, exposed, notExposed }) {
    // Chart: 1 series, xaxis kategori
    const chartOptions = {
        chart: {
            id: "leaks-bar",
            type: "bar",
            toolbar: { show: false },
            height: 350
        },
        theme: { mode: "dark" },
        plotOptions: {
            bar: {
                borderRadius: 6,
                horizontal: false,
                columnWidth: '40%',
                distributed: true,
            }
        },
        colors: ["#22d3ee", "#f43f5e", "#6366f1", "#f472b6"], // cyan, red, indigo, pink
        xaxis: {
            categories: ["Exposed", "Not Exposed", "Filtered", "Total"],
            labels: { style: { colors: "#aaa" } }
        },
        yaxis: { labels: { style: { colors: "#aaa" } }, min: 0 },
        grid: { borderColor: "#232339" },
        tooltip: { theme: "dark" }
    };

    const chartSeries = [{
        name: "Count",
        data: [exposed, notExposed, filtered, total]
    }];

    return (
        <div className="mb-8">
            {/* Statistic Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("green-500", "green-700", <MdCheckCircle size={28} />)}
                    <div>
                        <div className="text-lg font-bold text-white">{exposed}</div>
                        <div className="text-xs text-gray-400">Exposed</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("red-500", "red-700", <MdCancel size={28} />)}
                    <div>
                        <div className="text-lg font-bold text-white">{notExposed}</div>
                        <div className="text-xs text-gray-400">Not Exposed</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("blue-400", "cyan-800", <MdFilterList size={28} />)}
                    <div>
                        <div className="text-lg font-bold text-white">{filtered}</div>
                        <div className="text-xs text-gray-400">Filtered/Displayed</div>
                    </div>
                </div>
                <div className="bg-[#18181C] border border-[#26263a] rounded-xl p-4 flex items-center gap-3 shadow">
                    {statsIcon("cyan-400", "fuchsia-500", <MdNumbers size={28} />)}
                    <div>
                        <div className="text-lg font-bold text-white">{total}</div>
                        <div className="text-xs text-gray-400">Total Entries</div>
                    </div>
                </div>
            </div>
            {/* Bar Chart */}
            <div className="bg-[#18181C] border border-[#26263a] rounded-2xl shadow-xl p-4 md:p-6">
                <div className="mb-2 text-white font-semibold">Breach Exposure Metrics</div>
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                    height={350}
                />
            </div>
        </div>
    );
}