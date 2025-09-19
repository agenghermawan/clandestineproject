"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Footer from "../../../components/footer";
import {
  ShieldCheckIcon,
  FingerPrintIcon,
  BugAntIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

function CyberNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    ctx.scale(dpr, dpr);

    const colors = {
      primary: "#f03262",
      secondary: "#05d9e8",
      tertiary: "#d300c5",
      background: "#0a0a0f",
    };

    class CyberNode {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = 1 + Math.random() * 3;
        this.type = Math.random() > 0.7 ? "critical" : "normal";
        this.color = this.type === "critical" ? colors.primary : colors.secondary;
        this.speed = 0.1 + Math.random() * 0.3;
      }

      update() {
        if (Math.random() > 0.98) {
          this.x += (Math.random() - 0.5) * this.speed * 10;
          this.y += (Math.random() - 0.5) * this.speed * 10;
        } else {
          this.x += (Math.random() - 0.5) * this.speed;
          this.y += (Math.random() - 0.5) * this.speed;
        }
        this.x = Math.max(0, Math.min(width, this.x));
        this.y = Math.max(0, Math.min(height, this.y));
      }

      draw() {
        const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const nodes = Array.from({ length: 40 }, () => new CyberNode());
    const connections = [];

    function updateConnections() {
      connections.length = 0;
      nodes.forEach((node) => {
        if (node.type === "critical") {
          nodes
              .filter((n) => n !== node)
              .sort((a, b) => {
                const distA = Math.hypot(node.x - a.x, node.y - a.y);
                const distB = Math.hypot(node.x - b.x, node.y - b.y);
                return distA - distB;
              })
              .slice(0, 2 + Math.floor(Math.random() * 2))
              .forEach((target) => {
                connections.push({
                  from: node,
                  to: target,
                  strength: 0.3 + Math.random() * 0.4,
                });
              });
        }
      });
    }

    function animate() {
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      nodes.forEach((node) => node.update());
      if (Date.now() % 100 === 0) updateConnections();

      connections.forEach((conn) => {
        const dx = conn.to.x - conn.from.x;
        const dy = conn.to.y - conn.from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const pulse = 0.3 + 0.7 * Math.sin(Date.now() * 0.002);

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.strokeStyle = `rgba(240, 50, 98, ${conn.strength * pulse * 0.3})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        const progress = (Date.now() % 2000) / 2000;
        const animX = conn.from.x + dx * progress;
        const animY = conn.from.y + dy * progress;

        ctx.beginPath();
        ctx.arc(animX, animY, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 217, 232, ${pulse})`;
        ctx.fill();
      });

      nodes.forEach((node) => node.draw());

      requestAnimationFrame(animate);
    }

    updateConnections();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
      <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-90"
      />
  );
}

export default function AboutPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
      <div className="relative min-h-screen bg-[#0a0a0f] text-gray-200">
        <Navbar />

        {/* Hero Section */}
        <div className="relative h-screen w-full overflow-hidden">
          <CyberNetwork />

          <AnimatePresence>
            {loaded && (
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center px-6 lg:px-8 z-10"
                >
                  <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-center mb-12"
                    >
                      <Image
                          src="/image/logo.png"
                          alt="Clandestine Logo"
                          width={400}
                          height={120}
                          className="mx-auto mb-8 invert"
                      />
                      <div className="w-24 h-1 bg-gradient-to-r from-[#f03262] to-[#05d9e8] mx-auto mb-8"></div>

                      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#f03262] mb-6">
                        Darkweb Stealer & Leaks Monitoring, Vulnerability Scanning, and Cyber Threat Intelligence
                      </h1>

                      <p className="text-xl max-w-3xl mx-auto leading-relaxed">
                        A unified platform for monitoring data breaches, credential leaks, stealer malware activity, and security vulnerabilities across the surface and dark web, delivering real-time protection for modern organizations.
                      </p>
                    </motion.div>
                  </div>
                </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* About Content Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0f] to-[#131318]">
          <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="bg-[#f03262]/20 p-2 rounded-lg mr-4">
                    <FingerPrintIcon className="w-6 h-6 text-[#f03262]" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Our Vision & Mission</h2>
                </div>

                <p className="text-lg leading-relaxed">
                  We are dedicated to empowering enterprises, governments, and security teams to proactively detect and mitigate digital threats. Leveraging AI and data intelligence, we monitor darkweb, forums, stealer logs, and vulnerabilities to safeguard your digital assets from breaches and cyber attacks.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <MagnifyingGlassIcon className="w-5 h-5 text-[#05d9e8]" />,
                      title: "Darkweb Leaks Monitoring",
                      description:
                          "Automated detection of email, credential, and sensitive data exposures on darkweb marketplaces and underground forums.",
                    },
                    {
                      icon: <BugAntIcon className="w-5 h-5 text-[#f03262]" />,
                      title: "Stealer Logs Monitoring",
                      description:
                          "Real-time monitoring of stealer malware logs (Redline, Raccoon, Vidar, and more) that threaten your organization.",
                    },
                    {
                      icon: <ShieldCheckIcon className="w-5 h-5 text-[#05d9e8]" />,
                      title: "Vulnerability Scanning",
                      description:
                          "Automated asset scanning and alerting for newly discovered security vulnerabilities.",
                    },
                    {
                      icon: <GlobeAltIcon className="w-5 h-5 text-[#d300c5]" />,
                      title: "Realtime Alerts & Dashboard",
                      description:
                          "A unified dashboard with instant alerts, reporting, and API access for your SOC or IT team.",
                    },
                  ].map((item, index) => (
                      <div
                          key={index}
                          className="bg-[#131318] border border-gray-800 rounded-xl p-6 hover:border-[#f03262] transition-all"
                      >
                        <div className="flex items-center mb-3">
                          <div className="mr-3">{item.icon}</div>
                          <h4 className="font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                  ))}
                </div>
              </div>

              <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden border border-[#f03262]/30">
                <Image
                    src="https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Cyber Threat Intelligence"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6 bg-[#131318]">
          <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <span className="text-[#f03262] font-mono text-sm tracking-widest">OUR TEAM</span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">
                Threat Intelligence & Cybersecurity Experts
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Our team consists of penetration testers, threat analysts, OSINT researchers, and engineers experienced in darkweb investigation, breach detection, and scalable security monitoring systems.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Darkweb Intelligence",
                  description:
                      "Continuous monitoring and analysis of underground forums, logs, and data leaks.",
                  color: "from-[#f03262] to-[#d82a56]",
                },
                {
                  title: "Vulnerability Research",
                  description:
                      "Researchers and engineers specializing in scanning, identification, and patching of security vulnerabilities.",
                  color: "from-[#05d9e8] to-[#04c0d8]",
                },
                {
                  title: "Platform & Response",
                  description:
                      "DevOps and incident response building real-time alerting and dashboard systems.",
                  color: "from-[#d300c5] to-[#b800b0]",
                },
              ].map((item, index) => (
                  <motion.div
                      key={index}
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className={`bg-gradient-to-br ${item.color} p-0.5 rounded-xl`}
                  >
                    <div className="bg-[#131318] rounded-[11px] p-8 h-full">
                      <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-[#131318] to-black">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-[#131318] border border-gray-800 rounded-2xl p-12 shadow-lg shadow-[#f03262]/10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Protect Your Organization from Cyber Threats & Data Leaks
              </h2>
              <p className="text-gray-300 mb-8">
                Ready to monitor the darkweb, stealer logs, and vulnerabilities automatically? Contact us for a demo or a consultation to find the best solution for your digital security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                    href="/contact"
                    className="bg-gradient-to-r from-[#f03262] to-[#d82a56] hover:from-[#f03262]/90 hover:to-[#d82a56]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#f03262]/30"
                >
                  Request Demo
                </a>

              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
  );
}