"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/navbar";
import Image from "next/image";
import Footer from "../../../components/footer";
import {
    ShieldCheckIcon,
    LockClosedIcon,
    ChartBarIcon,
    UserGroupIcon,
    FingerPrintIcon,
    ServerStackIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

function ThreatNetwork() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;
        let width = canvas.width = window.innerWidth * dpr;
        let height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        class ThreatNode {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = 2 + Math.random() * 4;
                this.type = Math.random() > 0.7 ? 'critical' : 'normal';
                this.color = this.type === 'critical' ? '#f03262' : '#00f0ff';
                this.speed = 0.2 + Math.random() * 0.5;
            }

            update() {
                this.x += (Math.random() - 0.5) * this.speed;
                this.y += (Math.random() - 0.5) * this.speed;
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));
            }

            draw() {
                // Glow effect
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        const nodes = Array.from({ length: 50 }, () => new ThreatNode());
        const connections = [];

        function updateConnections() {
            connections.length = 0;
            nodes.forEach(node => {
                if (node.type === 'critical') {
                    // Connect to 3 closest nodes
                    nodes
                        .filter(n => n !== node)
                        .sort((a, b) => {
                            const distA = Math.hypot(node.x - a.x, node.y - a.y);
                            const distB = Math.hypot(node.x - b.x, node.y - b.y);
                            return distA - distB;
                        })
                        .slice(0, 3)
                        .forEach(target => {
                            connections.push({
                                from: node,
                                to: target,
                                strength: 0.5 + Math.random() * 0.5
                            });
                        });
                }
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Update nodes
            nodes.forEach(node => node.update());

            // Dynamic connections
            if (Date.now() % 120 === 0) updateConnections();

            // Draw connections
            connections.forEach(conn => {
                const dx = conn.to.x - conn.from.x;
                const dy = conn.to.y - conn.from.y;
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);

                // Animated data flow
                const progress = (Date.now() % 2000) / 2000;
                const animX = conn.from.x + dx * progress;
                const animY = conn.from.y + dy * progress;

                // Connection line
                ctx.beginPath();
                ctx.moveTo(conn.from.x, conn.from.y);
                ctx.lineTo(conn.to.x, conn.to.y);
                ctx.strokeStyle = `rgba(240, 50, 98, ${conn.strength * 0.3})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Data packet
                ctx.beginPath();
                ctx.arc(animX, animY, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
                ctx.fill();
            });

            // Draw nodes
            nodes.forEach(node => node.draw());

            requestAnimationFrame(animate);
        }

        updateConnections();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth * dpr;
            height = canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 opacity-80" />;
}

export default function EnterprisePage() {
    const [activeTab, setActiveTab] = useState("protection");

    return (
        <div className="bg-black text-white min-h-screen">
            <Navbar />

            {/* Cyber Threat Hero Section */}
            <div className="relative h-screen w-full overflow-hidden">
                <ThreatNetwork />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex items-center">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="lg:w-1/2 space-y-8">
                <span className="font-mono text-[#f03262] tracking-widest text-sm flex items-center">
                  <span className="w-3 h-3 bg-[#f03262] rounded-full mr-2 animate-pulse"></span>
                  ENTERPRISE THREAT INTELLIGENCE
                </span>
                                <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#f03262]">
                                    Dark Web Exposure Monitoring
                                </h1>
                                <p className="text-xl text-gray-300">
                                    Proactively detect compromised credentials, intellectual property leaks,
                                    and targeted threats across underground markets and hacker forums
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30 flex items-center">
                                        <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                        Request Enterprise Demo
                                    </button>
                                    <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all flex items-center">
                                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                        Run Exposure Scan
                                    </button>
                                </div>
                            </div>

                            <div className="lg:w-1/2 relative">
                                <div className="relative border-2 border-[#f03262]/30 rounded-xl overflow-hidden">
                                    <Image
                                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                        alt="Enterprise Threat Dashboard"
                                        width={800}
                                        height={500}
                                        className="object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                                        <div className="flex items-center">
                                            <div className="bg-[#f03262]/20 p-2 rounded-lg mr-4">
                                                <ServerStackIcon className="w-6 h-6 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Active Monitoring</h4>
                                                <p className="text-gray-300 text-sm">Tracking 1,200+ enterprise-related data leaks</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enterprise Challenges */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#f03262] font-mono text-sm tracking-widest">ENTERPRISE RISKS</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                            Modern Cybersecurity Challenges
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#f03262] to-[#d82a56] mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FingerPrintIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "Credential Compromise",
                                description: "Employee credentials circulating on dark web markets enable account takeover attacks",
                                stats: ["83% of breaches involve stolen credentials", "Average 12 days from leak to exploit"]
                            },
                            {
                                icon: <LockClosedIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "Data Exfiltration",
                                description: "Insider threats and external attackers selling proprietary data through covert channels",
                                stats: ["68% increase in corporate data leaks", "85% go undetected for months"]
                            },
                            {
                                icon: <UserGroupIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "Third-Party Risks",
                                description: "Vendor and supply chain vulnerabilities creating backdoor entry points",
                                stats: ["60% of breaches originate with third parties", "Only 34% audit vendor security"]
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="border border-gray-800 rounded-xl p-8 hover:border-[#f03262] transition-all hover:shadow-lg hover:shadow-[#f03262]/10 bg-gray-900/50"
                            >
                                <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-gray-300 mb-6">{item.description}</p>
                                <ul className="space-y-2">
                                    {item.stats.map((stat, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-start">
                                            <span className="text-[#f03262] mr-2">•</span>
                                            {stat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise Solutions */}
            <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#f03262] font-mono text-sm tracking-widest">ENTERPRISE SOLUTIONS</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                            Dark Web Protection Suite
                        </h2>
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-gray-900 rounded-full p-1 border border-gray-800 shadow-lg shadow-[#f03262]/10">
                            {['protection', 'compliance', 'assessment'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                                        activeTab === tab
                                            ? 'bg-gradient-to-r from-[#f03262] to-[#d82a56] text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {tab === 'protection' && 'Employee Protection'}
                                    {tab === 'compliance' && 'Regulatory Compliance'}
                                    {tab === 'assessment' && 'Risk Assessment'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {activeTab === "protection" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        Credential Leak Monitoring
                                    </h3>
                                    <p className="text-gray-300">
                                        Our system continuously scans underground markets, paste sites, and hacker forums for compromised corporate credentials, providing real-time alerts when employee accounts are exposed.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <UserGroupIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Employee Watch</h4>
                                                <p className="text-gray-400">Domain-wide credential monitoring with department-level segmentation</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <LockClosedIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Automated Remediation</h4>
                                                <p className="text-gray-400">Integration with IAM systems for automatic password resets</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}

                            {activeTab === "compliance" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        Compliance Automation
                                    </h3>
                                    <p className="text-gray-300">
                                        Generate audit-ready reports demonstrating proactive monitoring of dark web threats, satisfying requirements for GDPR, CCPA, NYDFS, and other regulatory frameworks.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <ChartBarIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Regulatory Mapping</h4>
                                                <p className="text-gray-400">Pre-configured report templates mapped to compliance requirements</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <ServerStackIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Evidence Archiving</h4>
                                                <p className="text-gray-400">Cryptographically verified screenshots and metadata preservation</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}

                            {activeTab === "assessment" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        Threat Landscape Analysis
                                    </h3>
                                    <p className="text-gray-300">
                                        Quantify your organization's exposure across darknet ecosystems with risk scoring that evaluates threat actor interest, data availability, and potential attack vectors.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <MagnifyingGlassIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Brand Monitoring</h4>
                                                <p className="text-gray-400">Track mentions of your company in criminal forums and marketplaces</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <FingerPrintIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Vulnerability Correlation</h4>
                                                <p className="text-gray-400">Cross-reference dark web chatter with your external attack surface</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>

                        <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden border border-[#f03262]/30">
                            {activeTab === "protection" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                    alt="Credential Protection"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {activeTab === "compliance" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                    alt="Compliance Dashboard"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {activeTab === "assessment" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1085&q=80"
                                    alt="Risk Assessment"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enterprise CTA */}
            <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 shadow-lg shadow-[#f03262]/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Secure Your Digital Perimeter
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            Our enterprise package includes executive threat briefings, dedicated analyst support, and API integration with your security stack
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30">
                                Request Enterprise Demo
                            </button>
                            <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all">
                                Download Solution Brief
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
