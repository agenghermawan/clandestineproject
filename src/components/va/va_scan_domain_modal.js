import { useState, useEffect, useRef } from "react";
import { MdAdd } from "react-icons/md";

export default function ScanDomainModal({
  open,
  onClose,
  onSubmit,
  allowedDomains = [],
  loading,
  error,
  isUnlimited = false // <-- Tambahkan default false
}) {
  const [domain, setDomain] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setDomain("");
  }, [open]);

  // --- MODIFIKASI VALIDASI ---
  const isAllowed = isUnlimited || !domain || allowedDomains.includes(domain.trim());

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isAllowed && domain && !loading) onSubmit(domain.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur flex items-center justify-center animate-fadeIn">
      <div
        className="relative bg-gradient-to-br from-[#232339] via-[#191924] to-[#18181c] border border-pink-700 shadow-2xl rounded-2xl max-w-2xl w-full mx-4 p-8 flex flex-col items-center animate-modalPop"
        tabIndex={-1}
        onKeyDown={e => e.key === "Escape" && onClose()}
        style={{ outline: "none" }}
      >
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl focus:outline-none transition"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <div className="mb-6 mt-2 flex justify-center">
          <div className="bg-pink-600/20 rounded-full p-3 animate-pulse shadow-lg">
            <MdAdd className="text-pink-400 text-4xl" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          Start New Vulnerability Scan
        </h2>
        <p className="text-gray-400 mb-6 text-center text-sm">
          {isUnlimited
            ? "You can scan any domain."
            : "Only your registered domains allowed."}
        </p>
        <input
          ref={inputRef}
          className={`w-full px-5 py-3 rounded-lg bg-black/60 border ${isAllowed || !domain ? "border-pink-700" : "border-red-500"} text-white mb-3 focus:ring-2 focus:ring-pink-500 focus:outline-none text-lg transition`}
          value={domain}
          onChange={e => setDomain(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
          aria-label="Domain"
          list={isUnlimited ? undefined : "allowed-domains"}
          placeholder={isUnlimited ? "Enter any domain (e.g. example.com)" : "Select or enter your registered domain"}
        />
        {!isUnlimited && allowedDomains.length > 0 && (
          <datalist id="allowed-domains">
            {allowedDomains.map((d) => <option key={d} value={d} />)}
          </datalist>
        )}
        {!isAllowed && domain && (
          <div className="w-full mb-2 px-3 py-2 rounded bg-pink-950 text-pink-400 text-xs text-center border border-pink-900 animate-fadeIn">
            Domain not allowed. Only your registered domains are permitted.
          </div>
        )}
        {error && (
          <div className="w-full mb-2 px-3 py-2 rounded bg-pink-950 text-pink-400 text-xs text-center border border-pink-900 animate-fadeIn">
            {error}
          </div>
        )}
        <button
          className={`w-full py-3 rounded-lg text-base font-semibold mt-2 transition
            ${loading || !domain || !isAllowed ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700 text-white shadow-lg"}
          `}
          onClick={() => isAllowed && domain && !loading && onSubmit(domain.trim())}
          disabled={loading || !domain || !isAllowed}
        >
          {loading ? (
            <span>
              <svg className="animate-spin inline w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-80" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Scanning...
            </span>
          ) : "Start Scan"}
        </button>
        <div className="w-full text-xs text-gray-400 mt-3 text-center">
          {isUnlimited
            ? "You can scan any domain."
            : allowedDomains.length
                ? <>Allowed domains: <span className="text-pink-400">{allowedDomains.join(", ")}</span></>
                : "No registered domains found."}
        </div>
      </div>
      <style jsx global>{`
        .animate-fadeIn { animation: fadeIn 0.25s; }
        .animate-modalPop { animation: modalPop 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalPop { from { transform: scale(0.96); opacity:0; } to { transform: scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}