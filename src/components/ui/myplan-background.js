'use client';
import {useEffect, useRef} from "react";

function ParticleLayer() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 800 600">
                <circle cx="200" cy="200" r="2.5" fill="#0ff" opacity="0.3"/>
                <circle cx="600" cy="120" r="2" fill="#f03262" opacity="0.2"/>
                <circle cx="700" cy="500" r="3" fill="#6b21a8" opacity="0.28"/>
                <circle cx="400" cy="400" r="1.5" fill="#fff" opacity="0.12"/>
                <circle cx="150" cy="500" r="2" fill="#0ff" opacity="0.18"/>
            </svg>
        </div>
    );
}

export default function AnimatedDarkWebBackground({children}) {
    const gradientRef = useRef(null);

    return (
        <div className="min-h-screen w-full relative z-0 overflow-x-hidden overflow-y-auto">
            {/* Animated multi-color gradient with blur */}
            <div
                ref={gradientRef}
                className="absolute inset-0 -z-20 bg-gradient-to-br from-[#161622] via-[#232339] to-[#101115] animate-darkweb-gradient"
            />
            {/* Neon Blobs */}
            <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[320px] opacity-60 blur-3xl pointer-events-none -z-10"
                style={{background: "radial-gradient(circle at 50% 50%, #0ff 0%, #232339 55%, transparent 80%)"}}
            />
            <div className="absolute top-32 right-0 w-[350px] h-[280px] opacity-50 blur-2xl pointer-events-none -z-10"
                 style={{background: "radial-gradient(circle at 80% 30%, #f03262 0%, #232339 55%, transparent 80%)"}}
            />
            <div className="absolute bottom-8 left-8 w-[200px] h-[120px] opacity-40 blur-2xl pointer-events-none -z-10"
                 style={{background: "radial-gradient(circle at 30% 80%, #6b21a8 0%, #232339 70%, transparent 92%)"}}
            />
            {/* Partikel cyber */}
            <ParticleLayer/>
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 pointer-events-none z-10"
                 style={{background: "url('/static/noise.png') repeat", opacity: 0.06}}/>
            {/* Animated top bar (neon line) */}
            <div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ff]/60 via-[#f03262]/60 to-[#6b21a8]/60 blur-sm opacity-80 animate-bar-glow"/>
            {/* Konten utama */}
            <div className="relative z-20">{children}</div>
            {/* CSS animation */}
            <style jsx>{`
                .animate-darkweb-gradient {
                    background-size: 200% 200%;
                    animation: darkWebGradient 16s ease-in-out infinite alternate;
                }

                @keyframes darkWebGradient {
                    0% {
                        background-position: 0% 40%;
                    }
                    50% {
                        background-position: 100% 60%;
                    }
                    100% {
                        background-position: 0% 40%;
                    }
                }

                .animate-bar-glow {
                    animation: barGlow 2.4s ease-in-out infinite alternate;
                }

                @keyframes barGlow {
                    0% {
                        filter: blur(5px) brightness(1.2);
                    }
                    100% {
                        filter: blur(10px) brightness(1.5);
                    }
                }
            `}</style>
        </div>
    );
}