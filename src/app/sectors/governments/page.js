"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/navbar";
import Image from "next/image";
import Footer from "../../../components/footer";
import {
    ShieldCheckIcon,
    LockClosedIcon,
    GlobeAltIcon,
    FingerPrintIcon,
    ServerStackIcon,
    MagnifyingGlassIcon,
    IdentificationIcon
} from "@heroicons/react/24/outline";

function NationalThreatMap() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;
        let width = canvas.width = window.innerWidth * dpr;
        let height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        // National security threat types
        const threatTypes = [
            { name: 'APT', color: '#f03262', size: 4 },
            { name: 'CyberEspionage', color: '#00f0ff', size: 3 },
            { name: 'CriticalInfra', color: '#d300c5', size: 5 },
            { name: 'DataLeak', color: '#05d9e8', size: 2 }
        ];

        class ThreatNode {
            constructor() {
                this.type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = this.type.size;
                this.speed = 0.2 + Math.random() * 0.5;
                this.connections = [];
            }

            update() {
                // Simulate coordinated movement patterns
                this.x += (Math.random() - 0.5) * this.speed;
                this.y += (Math.random() - 0.5) * this.speed;

                // Keep within bounds
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));
            }

            draw() {
                // Glowing core
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, this.type.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Threat type indicator
                if (this.size > 3) {
                    ctx.font = 'bold 10px monospace';
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.type.name, this.x, this.y + this.size + 12);
                }
            }
        }

        const nodes = Array.from({ length: 30 }, () => new ThreatNode());
        const connections = [];

        function updateConnections() {
            connections.length = 0;
            nodes.forEach(node => {
                // APT nodes coordinate others
                if (node.type.name === 'APT') {
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
                                strength: 0.7
                            });
                        });
                }
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Dark background with subtle grid
            ctx.fillStyle = 'rgba(5, 5, 10, 0.8)';
            ctx.fillRect(0, 0, width, height);

            // Update nodes
            nodes.forEach(node => node.update());

            // Dynamic connections
            if (Date.now() % 90 === 0) updateConnections();

            // Draw connections
            connections.forEach(conn => {
                const dx = conn.to.x - conn.from.x;
                const dy = conn.to.y - conn.from.y;

                // Pulsing effect
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);

                // Connection line
                ctx.beginPath();
                ctx.moveTo(conn.from.x, conn.from.y);
                ctx.lineTo(conn.to.x, conn.to.y);
                ctx.strokeStyle = `rgba(240, 50, 98, ${conn.strength * 0.4})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Command & control animation
                const progress = (Date.now() % 3000) / 3000;
                const animX = conn.from.x + dx * progress;
                const animY = conn.from.y + dy * progress;

                ctx.beginPath();
                ctx.arc(animX, animY, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
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

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 opacity-90" />;
}

export default function GovernmentPage() {
    const [activeTab, setActiveTab] = useState("monitoring");

    return (
        <div className="bg-black text-white min-h-screen">
            <Navbar />

            {/* National Security Hero Section */}
            <div className="relative h-screen w-full overflow-hidden">
                <NationalThreatMap />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex items-center">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="lg:w-1/2 space-y-8">
                <span className="font-mono text-[#f03262] tracking-widest text-sm flex items-center">
                  <span className="w-3 h-3 bg-[#f03262] rounded-full mr-2 animate-pulse"></span>
                  NATIONAL SECURITY SOLUTIONS
                </span>
                                <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#f03262]">
                                    Sovereign Threat Intelligence
                                </h1>
                                <p className="text-xl text-gray-300">
                                    Classified-grade monitoring of APT groups, cyber warfare activities,
                                    and critical infrastructure threats targeting national assets
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30 flex items-center">
                                        <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                        Request Secure Briefing
                                    </button>
                                    <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all flex items-center">
                                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                        View Threat Reports
                                    </button>
                                </div>
                            </div>

                            <div className="lg:w-1/2 relative">
                                <div className="relative border-2 border-[#f03262]/30 rounded-xl overflow-hidden">
                                    <Image
                                        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                        alt="National Security Dashboard"
                                        width={800}
                                        height={500}
                                        className="object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                                        <div className="flex items-center">
                                            <div className="bg-[#f03262]/20 p-2 rounded-lg mr-4">
                                                <GlobeAltIcon className="w-6 h-6 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Active APT Tracking</h4>
                                                <p className="text-gray-300 text-sm">Monitoring 180+ state-sponsored threat actors</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* National Security Challenges */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#f03262] font-mono text-sm tracking-widest">SOVEREIGN THREATS</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                            Cybersecurity Challenges for Governments
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#f03262] to-[#d82a56] mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <GlobeAltIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "APT Campaigns",
                                description: "Advanced persistent threats targeting government networks with surgical precision",
                                stats: ["78% of governments targeted weekly", "Average dwell time: 280 days"]
                            },
                            {
                                icon: <ServerStackIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "Infrastructure Attacks",
                                description: "Disruptive attacks against power grids, transportation, and communication systems",
                                stats: ["3.4x increase since 2022", "60% target industrial control systems"]
                            },
                            {
                                icon: <IdentificationIcon className="w-8 h-8 text-[#f03262]" />,
                                title: "Data Exfiltration",
                                description: "Theft of classified documents, citizen data, and diplomatic communications",
                                stats: ["42TB stolen annually", "85% via compromised credentials"]
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

            {/* Government Solutions */}
            <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#f03262] font-mono text-sm tracking-widest">SOVEREIGN DEFENSE</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                            National Cybersecurity Operations
                        </h2>
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-gray-900 rounded-full p-1 border border-gray-800 shadow-lg shadow-[#f03262]/10">
                            {['monitoring', 'breach', 'assessment'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                                        activeTab === tab
                                            ? 'bg-gradient-to-r from-[#f03262] to-[#d82a56] text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {tab === 'monitoring' && 'Threat Monitoring'}
                                    {tab === 'breach' && 'Breach Detection'}
                                    {tab === 'assessment' && 'Strategic Assessment'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {activeTab === "monitoring" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        APT Group Surveillance
                                    </h3>
                                    <p className="text-gray-300">
                                        Real-time tracking of state-sponsored hacking groups with attribution
                                        intelligence, TTP analysis, and campaign monitoring across darknet
                                        forums and encrypted channels.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <MagnifyingGlassIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Actor Profiling</h4>
                                                <p className="text-gray-400">400+ documented APT groups with aliases and toolkits</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <FingerPrintIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Infrastructure Mapping</h4>
                                                <p className="text-gray-400">C2 servers, proxy chains, and operational infrastructure</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}

                            {activeTab === "breach" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        Classified Data Protection
                                    </h3>
                                    <p className="text-gray-300">
                                        Early warning system for government data leaks across underground markets,
                                        with automated classification analysis and damage assessment protocols.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <LockClosedIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Sensitive Data Fingerprinting</h4>
                                                <p className="text-gray-400">Document watermarking and cryptographic tagging</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <ServerStackIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Insider Threat Detection</h4>
                                                <p className="text-gray-400">Anomalous access pattern recognition</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}

                            {activeTab === "assessment" && (
                                <>
                                    <h3 className="text-3xl font-bold text-white">
                                        Strategic Threat Assessment
                                    </h3>
                                    <p className="text-gray-300">
                                        National cyber risk scoring with sector-specific threat modeling,
                                        vulnerability impact analysis, and geopolitical threat forecasting.
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <GlobeAltIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Critical Sector Analysis</h4>
                                                <p className="text-gray-400">Energy, finance, healthcare, and defense sector threats</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                                                <ShieldCheckIcon className="w-5 h-5 text-[#f03262]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Red Team Simulation</h4>
                                                <p className="text-gray-400">Adversary emulation of nation-state attack chains</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>

                        <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden border border-[#f03262]/30">
                            {activeTab === "monitoring" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                    alt="APT Monitoring"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {activeTab === "breach" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                    alt="Data Breach Detection"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {activeTab === "assessment" && (
                                <Image
                                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1085&q=80"
                                    alt="Threat Assessment"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Government CTA */}
            <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 shadow-lg shadow-[#f03262]/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Secure Your Nation's Digital Frontier
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            Our government program includes TS/SCI-level briefings, dedicated
                            intelligence officers, and secure API integration with national CERTs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30">
                                Request Classified Demo
                            </button>
                            <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all">
                                Download White Paper
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
