"use client";
import React from "react";
import Modal from "./modal-dashboard";

export default function ConfirmModal({ isOpen, opts = {}, onClose, onResult }) {
    // opts: { title, description, confirmText, cancelText, tone } tone = "danger"|"primary"
    const {
        title = "Are you sure?",
        description = "",
        confirmText = "Yes",
        cancelText = "Cancel",
        tone = "danger",
    } = opts;

    const confirmClass =
        tone === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-cyan-600 hover:bg-cyan-700";

    return (
        <Modal isOpen={isOpen} title={title} onClose={() => onResult(false)} size="sm" showClose={false}>
            <div className="text-sm text-gray-300 mb-4">
                {description}
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    className="px-4 py-2 rounded-lg bg-[#1f2937] text-gray-300 hover:bg-[#2b3240] transition"
                    onClick={() => onResult(false)}
                >
                    {cancelText}
                </button>

                <button
                    className={`${confirmClass} px-4 py-2 rounded-lg text-white font-semibold transition`}
                    onClick={() => onResult(true)}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}