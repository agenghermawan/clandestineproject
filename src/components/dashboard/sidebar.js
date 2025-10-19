import React from "react";
import { usePathname } from "next/navigation";
import { FaUsers, FaChartArea, FaShieldAlt } from "react-icons/fa";

export default function Sidebar() {
    const pathname = typeof window !== "undefined"
        ? window.location.pathname
        : "/"; // fallback for SSR

    const menu = [
        {
            href: "/the-special-one/dashboard",
            icon: <FaChartArea className="mr-3" />,
            label: "Statistics",
        },
        {
            href: "/the-special-one/user-management",
            icon: <FaUsers className="mr-3" />,
            label: "User Management",
        },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-[#18181c] border-r border-[#23232b] shadow-xl z-20">
            <div className="p-6 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#f03262] via-[#232339] to-[#1a1b20] shadow-lg animate-pulse">
                    <FaShieldAlt className="text-white text-4xl drop-shadow" />
                </span>
            </div>
            <nav className="flex-1">
                <ul className="mt-8 space-y-2">
                    {menu.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={
                                        "flex items-center px-6 py-3 rounded-lg font-bold transition-all " +
                                        (isActive
                                            ? "text-pink-400 bg-[#23232b] shadow-inner"
                                            : "text-gray-400 hover:bg-[#23232b] hover:text-pink-400")
                                    }
                                >
                                    {item.icon} {item.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="px-6 py-4 text-xs text-gray-500">
                &copy; 2025 Clandestine Admin
            </div>
        </aside>
    );
}