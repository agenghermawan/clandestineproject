import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#0D0D10] border-t border-gray-800">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Brand Column */}
                    <div className="md:col-span-3">
                        <div className="flex items-center mb-6">
                            <Image
                                src="/image/logo.png"
                                alt="Clandestine"
                                width={240}
                                height={48}
                                className="invert"
                            />
                        </div>
                        <p className="text-gray-400 text-sm">
                            AI-powered dark web intelligence platform protecting your digital assets
                        </p>
                    </div>

                    {/* Navigation - Fitur utama */}
                    <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Monitoring */}
                        <div>
                            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Monitoring</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/dark_web/stealer" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        Darkweb Stealer Monitoring
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dark_web/leaks" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        Darkweb Leaks Monitoring
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Scanning */}
                        <div>
                            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Scanning</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/vulnerabilities" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        Vulnerability Scanning
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Pricing */}
                        <div>
                            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Pricing</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/pricing" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        Plans & Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Company */}
                        <div>
                            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Company</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/company/about" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-gray-400 hover:text-[#f33d74] text-sm transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-16 pt-8  flex flex-col md:flex-row justify-center items-center">
                    <span className="text-gray-500 text-sm mb-4 md:mb-0">
                        © 2025 Clandestine Project. All rights reserved
                    </span>
                </div>
            </div>
        </footer>
    );
}