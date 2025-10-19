"use client";
import React from "react";
import { Toaster } from "react-hot-toast";

export default function AppToaster() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options
                style: {
                    background: "#0f1724",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.06)",
                },
            }}
        />
    );
}