'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext"; // pastikan path benar
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const logoImgRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();


    // Ambil state dari context
    const { authState, user, logout } = useAuth();

    // GSAP logo entrance
    useEffect(() => {
        if (logoImgRef.current) {
            gsap.fromTo(logoImgRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.3 }
            );
        }
    }, []);

    // GSAP mobile menu entrance
    useEffect(() => {
        if (isMobileMenuOpen && mobileMenuRef.current) {
            gsap.fromTo(mobileMenuRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
            );
        }
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // Dropdown outside click
    useEffect(() => {
        if (!isDropdownOpen) return;
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    // GSAP logo hover animation
    const handleLogoHover = useCallback(() => {
        if (logoImgRef.current) {
            gsap.to(logoImgRef.current, {
                scale: 1.08,
                duration: 0.25,
                ease: "back.out(2)",
                yoyo: true,
                repeat: 1
            });
        }
    }, []);

    const handleMobileMenuToggle = useCallback(() => {
        setIsMobileMenuOpen(open => !open);
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                logout(); // update context!
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (authState === "loading") return null;
    const isLoggedIn = authState === "authenticated";

    const menuItems = [
        { href: "/dark_web/stealer", label: "Darkweb Stealer Monitoring" },
        { href: "/dark_web/leaks", label: "Darkweb Leaks Monitoring" },
        { href: "/vulnerabilities", label: "Vulnerability Scanning" },
        { href: "/pricing", label: "Pricing" },
    ];
    const dropdownItems = [
        { href: "/my-payments", label: "My Payments" },
        { href: "/my-plan", label: "My Plan" },
    ];
    const mobileMenuItems = [...menuItems, ...(isLoggedIn ? dropdownItems : [])];

    return (
        <header className="z-50 bg-[#14141f] w-full shadow-lg sticky top-0">
            {/* Mobile Navbar */}
            <nav className="md:hidden flex justify-between items-center p-4">
                <Link href="/" className="flex items-center" aria-label="Home">
                    <Image
                        src="/image/logo.png"
                        alt="logo"
                        width={200}
                        height={75}
                        className="invert hover:cursor-pointer transition-transform"
                        ref={logoImgRef}
                        onMouseEnter={handleLogoHover}
                        priority
                    />
                </Link>
                <button
                    className="text-white hover:text-[#f53d6b] transition-colors duration-300"
                    onClick={handleMobileMenuToggle}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" />
                            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" />
                            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    className="md:hidden mt-2 text-white bg-[#14141f] rounded-lg p-4 shadow-xl"
                >
                    <div className="space-y-4">
                        {mobileMenuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2 hover:bg-gray-800 rounded hover:text-[#f53d6b] transition-colors duration-300"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="flex space-x-4 pt-4">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 rounded-lg border border-[#1c1f26] text-white hover:bg-[#f53d6b] hover:scale-105 transition-all duration-300"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="w-full block text-white px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 font-semibold transition-all duration-300 text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Navbar */}
            <nav className="hidden md:flex justify-between items-center w-full max-w-[90%] mx-auto p-6">
                <Link href="/" className="flex items-center" aria-label="Home">
                    <Image
                        src="/image/logo.png"
                        alt="logo"
                        width={200}
                        height={50}
                        className="invert hover:cursor-pointer transition-transform"
                        ref={logoImgRef}
                        onMouseEnter={handleLogoHover}
                        priority
                    />
                </Link>

                <div className="flex flex-row items-center space-x-6 text-white">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="font-medium flex items-center hover:text-[#f53d6b] transition-colors duration-300 text-[16px]"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center justify-end space-x-4">
                    {isLoggedIn ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(open => !open)}
                                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:bg-[#232339] transition-all duration-200 border border-[#29293b] font-semibold"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                                aria-controls="navbar-dropdown"
                            >
                                <svg className="w-5 h-5 text-[#f33d74]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                                </svg>
                                My Account
                                <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div
                                    id="navbar-dropdown"
                                    className="absolute right-0 mt-2 w-56 bg-[#232339] rounded-lg shadow-lg border border-[#2a2a3a] ring-1 ring-black ring-opacity-5 z-50 divide-y divide-[#29293b]"
                                >
                                    {dropdownItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block px-5 py-3 text-sm text-white hover:bg-[#22223a] transition-colors duration-200"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-3 text-sm text-[#f33d74] hover:bg-[#22223a] hover:text-red-400 transition-colors duration-200 rounded-b-lg"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-white px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 font-semibold flex items-center justify-center min-w-[120px] transition-all duration-300">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}