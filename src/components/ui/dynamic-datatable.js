import React, { useState } from "react";

function renderValue(value, level = 0) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">N/A</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">[empty]</span>;
    if (value.every(v => typeof v !== "object" || v === null)) {
      return <span>{value.join(", ")}</span>;
    }
    return (
      <div className={`pl-${Math.min(level * 2, 8)}`}>
        {value.map((item, idx) => (
          <div key={idx} className="my-1">
            {renderValue(item, level + 1)}
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

export default function DynamicProfileInfo({ data, level = 0, previewCount = 3 }) {
  const [showAll, setShowAll] = useState(false);

  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-gray-400 italic">No Data</span>;

  // Logic Read More/Less hanya untuk level root (level === 0)
  const toShow = (level === 0 && !showAll) ? entries.slice(0, previewCount) : entries;

  return (
    <div>
      <table
        className={`min-w-[200px] text-xs bg-transparent ${
          level ? "border border-gray-700 my-1 rounded bg-[#191b20]/60" : ""
        }`}
      >
        <tbody>
          {toShow.map(([key, value]) => (
            <tr key={key}>
              <td
                className={`align-top pr-2 py-1 font-semibold text-left text-gray-400 whitespace-nowrap ${
                  level ? "pl-2" : ""
                }`}
                style={{ verticalAlign: "top", minWidth: 80 }}
              >
                {key}
              </td>
              <td className="py-1 break-all text-gray-100">{renderValue(value, level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* tombol Read More hanya di level root dan kalau field lebih banyak dari previewCount */}
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