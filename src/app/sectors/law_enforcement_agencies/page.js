"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/navbar";
import Image from "next/image";
import Footer from "../../../components/footer";
import {
  ShieldCheckIcon,
  FingerPrintIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ServerStackIcon,
  GlobeAltIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";

function CyberGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    let width = canvas.width = window.innerWidth * dpr;
    let height = canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = 2 + Math.random() * 3;
        this.type = Math.random() > 0.5 ? 'source' : 'target';
        this.color = this.type === 'source' ? '#f03262' : '#00f0ff';
        this.speed = 0.3 + Math.random() * 0.7;
      }

      update() {
        // Add subtle movement
        this.x += (Math.random() - 0.5) * this.speed;
        this.y += (Math.random() - 0.5) * this.speed;

        // Keep within bounds
        this.x = Math.max(0, Math.min(width, this.x));
        this.y = Math.max(0, Math.min(height, this.y));
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        // Glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const nodes = Array.from({ length: 40 }, () => new Node());
    const connections = [];

    // Create dynamic connections
    function updateConnections() {
      connections.length = 0;
      nodes.forEach(node => {
        if (node.type === 'source') {
          // Find closest 2 targets
          const targets = nodes
              .filter(n => n.type === 'target')
              .sort((a, b) => {
                const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2));
                const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2));
                return distA - distB;
              })
              .slice(0, 2);

          targets.forEach(target => {
            connections.push({
              from: node,
              to: target,
              alpha: 0.3 + Math.random() * 0.7
            });
          });
        }
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Update node positions
      nodes.forEach(node => node.update());

      // Update connections every 60 frames
      if (Date.now() % 60 === 0) updateConnections();

      // Draw connections with pulsing effect
      connections.forEach(conn => {
        const dx = conn.to.x - conn.from.x;
        const dy = conn.to.y - conn.from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);

        // Data flow animation
        const progress = (Date.now() % 2000) / 2000;
        const animX = conn.from.x + dx * progress;
        const animY = conn.from.y + dy * progress;

        // Connection line
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.strokeStyle = `rgba(240, 50, 98, ${conn.alpha * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Animated data packet
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

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 opacity-70" />;
}

export default function LawEnforcementPage() {
  const [activeTab, setActiveTab] = useState("investigation");

  return (
      <div className="bg-black text-white min-h-screen">
        <Navbar />

        {/* Cyberpunk Hero Section */}
        <div className="relative h-screen w-full overflow-hidden">
          <CyberGrid />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 space-y-8">
                <span className="font-mono text-[#f03262] tracking-widest text-sm flex items-center">
                  <span className="w-3 h-3 bg-[#f03262] rounded-full mr-2 animate-pulse"></span>
                  LAW ENFORCEMENT SOLUTIONS
                </span>
                  <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#f03262]">
                    Dark Web Intelligence Platform
                  </h1>
                  <p className="text-xl text-gray-300">
                    Advanced tools for tracking criminal activity across Tor networks, encrypted markets, and underground forums
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      Request Demo
                    </button>
                    <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all flex items-center">
                      <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                      View Case Studies
                    </button>
                  </div>
                </div>

                <div className="lg:w-1/2 relative">
                  <div className="relative border-2 border-[#f03262]/30 rounded-xl overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Dark Web Monitoring Dashboard"
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
                          <h4 className="font-bold text-white">Live Monitoring</h4>
                          <p className="text-gray-300 text-sm">Tracking 3,200+ darknet endpoints in real-time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f03262] font-mono text-sm tracking-widest">OPERATIONAL CHALLENGES</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                Overcoming Digital Investigation Barriers
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#f03262] to-[#d82a56] mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <GlobeAltIcon className="w-8 h-8 text-[#f03262]" />,
                  title: "Dark Web Anonymity",
                  description: "Criminals leverage Tor, I2P, and VPNs to hide their activities and identities",
                  stats: ["85% of drug markets are Tor-hidden", "60+ privacy-focused cryptocurrencies"]
                },
                {
                  icon: <LockClosedIcon className="w-8 h-8 text-[#f03262]" />,
                  title: "Encrypted Communications",
                  description: "End-to-end encryption makes intercepting criminal communications nearly impossible",
                  stats: ["Signal, Wickr, Session adoption up 300%", "PGP still prevalent in darknet markets"]
                },
                {
                  icon: <CpuChipIcon className="w-8 h-8 text-[#f03262]" />,
                  title: "Data Overload",
                  description: "Manual analysis can't keep pace with the volume of dark web activity",
                  stats: ["2.5M+ new darknet listings monthly", "500GB+ daily chatter in criminal forums"]
                },
                {
                  icon: <FingerPrintIcon className="w-8 h-8 text-[#f03262]" />,
                  title: "Advanced OPSEC",
                  description: "Sophisticated operational security makes attribution extremely difficult",
                  stats: ["Chain hopping common in money laundering", "Multi-layered identity obfuscation"]
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

        {/* Use Cases Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f03262] font-mono text-sm tracking-widest">OPERATIONAL USE CASES</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
                Specialized Investigation Tools
              </h2>
            </div>

            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-gray-900 rounded-full p-1 border border-gray-800 shadow-lg shadow-[#f03262]/10">
                {['investigation', 'hunting', 'response'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                            activeTab === tab
                                ? 'bg-gradient-to-r from-[#f03262] to-[#d82a56] text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                      {tab === 'investigation' && 'Digital Forensics'}
                      {tab === 'hunting' && 'Suspect Tracking'}
                      {tab === 'response' && 'Threat Response'}
                    </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {activeTab === "investigation" && (
                    <>
                      <h3 className="text-3xl font-bold text-white">
                        Dark Web Evidence Collection
                      </h3>
                      <p className="text-gray-300">
                        Our platform automates the preservation of digital evidence from darknet markets and forums, creating court-admissible documentation chains with cryptographic verification.
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <MagnifyingGlassIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Automated Archiving</h4>
                            <p className="text-gray-400">Continuous monitoring with WARC format preservation</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <FingerPrintIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Blockchain Verification</h4>
                            <p className="text-gray-400">SHA-256 hashes anchored to Ethereum blockchain</p>
                          </div>
                        </li>
                      </ul>
                    </>
                )}

                {activeTab === "hunting" && (
                    <>
                      <h3 className="text-3xl font-bold text-white">
                        Criminal Network Mapping
                      </h3>
                      <p className="text-gray-300">
                        Advanced entity recognition and relationship mapping reveals connections between darknet personas, cryptocurrency wallets, and real-world identities.
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <GlobeAltIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Cross-Platform Correlation</h4>
                            <p className="text-gray-400">Links forum handles to market vendor accounts</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <CpuChipIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Blockchain Analysis</h4>
                            <p className="text-gray-400">Tracks cryptocurrency flows across mixers and exchanges</p>
                          </div>
                        </li>
                      </ul>
                    </>
                )}

                {activeTab === "response" && (
                    <>
                      <h3 className="text-3xl font-bold text-white">
                        Real-Time Threat Interdiction
                      </h3>
                      <p className="text-gray-300">
                        Immediate alerts when your jurisdiction is targeted by darknet threats, with automated takedown request generation for clearnet infrastructure.
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <ServerStackIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Critical Alert System</h4>
                            <p className="text-gray-400">Push notifications for imminent threats</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-[#f03262]/10 p-2 rounded-lg mr-4">
                            <LockClosedIcon className="w-5 h-5 text-[#f03262]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Automated Takedowns</h4>
                            <p className="text-gray-400">Pre-formatted abuse reports for hosting providers</p>
                          </div>
                        </li>
                      </ul>
                    </>
                )}
              </div>

              <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden border border-[#f03262]/30">
                {activeTab === "investigation" && (
                    <Image
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Digital Forensics"
                        fill
                        className="object-cover"
                    />
                )}
                {activeTab === "hunting" && (
                    <Image
                        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Suspect Tracking"
                        fill
                        className="object-cover"
                    />
                )}
                {activeTab === "response" && (
                    <Image
                        src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1085&q=80"
                        alt="Threat Response"
                        fill
                        className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 shadow-lg shadow-[#f03262]/10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Illuminate the Dark Web?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Schedule a confidential demo to see how our platform can enhance your investigative capabilities
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30">
                  Request Law Enforcement Demo
                </button>
                <button className="border border-[#f03262] text-[#f03262] hover:bg-[#f03262]/10 px-8 py-4 rounded-lg font-medium transition-all">
                  Contact Cybercrime Unit
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
  );
}
