"use client";
import React, {useEffect} from "react";

export default function Modal({
                                  isOpen,
                                  title,
                                  children,
                                  onClose,
                                  footer = null,
                                  size = "md", // sm | md | lg | xl
                                  showClose = true,
                              }) {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);
        // prevent body scroll
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = original;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div
                className="fixed inset-0 bg-black/65 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`relative w-full mx-4 ${sizes[size]} bg-gradient-to-br from-[#0f1724] to-[#14121a] border border-[#23232b] rounded-2xl shadow-2xl p-6 transform transition-all`}
                style={{zIndex: 60}}
            >
                <header className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>}
                    </div>
                    {showClose && (
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="ml-auto text-gray-400 hover:text-white rounded-md p-2 transition"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.5" className="text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    )}
                </header>

                <div className="max-h-[70vh] overflow-auto pr-2">{children}</div>

                {footer && <footer className="mt-4">{footer}</footer>}
            </div>
        </div>
    );
}