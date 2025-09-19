'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function SlideLoader() {
    const containerRef = useRef(null)
    const blocksRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animasi sliding blocks
            gsap.fromTo(blocksRef.current,
                { x: -100, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.15,
                    duration: 0.8,
                    ease: "power3.out",
                    repeat: -1,
                    yoyo: true,
                    yoyoEase: "sine.inOut"
                }
            )

            // Background slide effect
            gsap.to(containerRef.current, {
                backgroundPosition: '200% 0',
                duration: 3,
                ease: "none",
                repeat: -1
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-gradient-to-r from-[#0D0D10] via-[#1a1a2e] to-[#0D0D10] bg-[length:200%_100%] z-50 flex items-center justify-center overflow-hidden"
        >
            <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        ref={el => blocksRef.current[i] = el}
                        className="w-4 h-16 bg-gradient-to-b from-[#f03262] to-[#ff7676] rounded-sm shadow-lg shadow-[#f03262]/50"
                    />
                ))}
            </div>
        </div>
    )
}
