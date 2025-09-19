import { MdStop, MdCheckCircle, MdError } from "react-icons/md";

export default function VAScanPollingBar({
                                             scanId,
                                             scanName,
                                             status,
                                             progress = 0,
                                             onStop,
                                             isStopping = false,
                                             startedAt,
                                             estimatedDuration
                                         }) {
    // Status label & icon
    let statusLabel = "Scanning...";
    let statusIcon = (
        <svg
            className="animate-spin w-6 h-6 text-white mr-1"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
    let accent = "bg-pink-700/95 border-pink-400";
    if (status === "finished" || status === "completed") {
        statusLabel = "Scan Completed";
        statusIcon = <MdCheckCircle className="text-green-400 w-6 h-6 mr-1" />;
        accent = "bg-green-700/95 border-green-400";
    } else if (status === "failed") {
        statusLabel = "Scan Failed";
        statusIcon = <MdError className="text-red-400 w-6 h-6 mr-1" />;
        accent = "bg-red-700/95 border-red-400";
    }
    // Format waktu estimasi
    const eta =
        estimatedDuration &&
        !["finished", "failed", "completed", "stopping"].includes(status)
            ? `Est. ${estimatedDuration}`
            : "";
    // Progress bar style
    const showProgress =
        typeof progress === "number" &&
        progress > 0 &&
        progress < 100 &&
        !["finished", "failed", "completed", "stopping"].includes(status);

    return (
        <div
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[1050] px-7 py-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[340px] max-w-[420px] animate-fadeIn font-bold text-white text-base border ${accent} backdrop-blur-lg`}
        >
            <div className="flex items-center gap-2">
                {statusIcon}
                <span>{statusLabel}</span>
                <span className="ml-2 font-mono text-sm bg-black/40 px-2 py-1 rounded">
          {scanName || scanId}
        </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-normal mt-1">
        <span>
          Scan ID: <span className="font-mono">{scanId}</span>
        </span>
                {eta && <span className="text-cyan-400">{eta}</span>}
                {startedAt && (
                    <span className="text-gray-300">
            Started: {new Date(startedAt).toLocaleTimeString()}
          </span>
                )}
            </div>
            {showProgress && (
                <div className="relative w-full bg-black/30 rounded-full h-4 overflow-hidden mt-3 border border-pink-800 shadow">
                    <div
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-l-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <span className="absolute text-xs font-bold w-full text-center top-0 left-0">
            {progress}%
          </span>
                </div>
            )}
            {/* Stop/cancel button during running */}
            {["running", "starting", "queued"].includes(status) && onStop && (
                <button
                    className={`mt-3 px-5 py-2 rounded-lg bg-black/40 border border-pink-600 text-pink-300 font-semibold transition hover:bg-pink-800/80 hover:text-white flex items-center gap-2 ${
                        isStopping ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isStopping}
                    onClick={onStop}
                >
                    <MdStop size={18} />
                    {isStopping ? "Stopping..." : "Stop Scan"}
                </button>
            )}
        </div>
    );
}