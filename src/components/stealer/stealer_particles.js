import {useEffect, useRef} from "react";

function CyberParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Initial setup
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        // Configuration
        const config = {
            particleCount: 80,
            connectionDistance: 120,
            colors: {
                primary: "#ff2a6d",
                secondary: "#05d9e8",
                tertiary: "#d300c5",
            },
        };

        // Particle types
        class DataParticle {
            constructor() {
                this.reset();
                this.velocity = 0.5 + Math.random() * 2;
                this.size = 2 + Math.random() * 3;
                this.char = String.fromCharCode(
                    Math.random() > 0.3
                        ? 48 + Math.floor(Math.random() * 10) // Numbers
                        : 97 + Math.floor(Math.random() * 26) // Letters
                );
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + 20;
                this.alpha = 0.1 + Math.random() * 0.9;
            }

            update() {
                this.y -= this.velocity;
                if (this.y < -20) this.reset();
            }

            draw() {
                ctx.font = `${this.size}px 'Courier New', monospace`;
                ctx.fillStyle = `rgba(${
                    Math.random() > 0.7 ? "255, 42, 109" : "5, 217, 232"
                }, ${this.alpha})`;
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        class NetworkNode {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseSize = 2 + Math.random() * 4;
                this.pulseSpeed = 0.01 + Math.random() * 0.03;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.pulsePhase += this.pulseSpeed;
            }

            draw() {
                const pulseSize = this.baseSize * (1 + Math.sin(this.pulsePhase) * 0.5);

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    this.x,
                    this.y,
                    0,
                    this.x,
                    this.y,
                    pulseSize * 3
                );
                gradient.addColorStop(0, config.colors.secondary);
                gradient.addColorStop(1, "rgba(5, 217, 232, 0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.fillStyle = config.colors.primary;
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        const particles = {
            data: Array.from(
                {length: config.particleCount / 2},
                () => new DataParticle()
            ),
            nodes: Array.from(
                {length: config.particleCount / 4},
                () => new NetworkNode()
            ),
        };

        // Connection logic
        function drawConnections() {
            for (let i = 0; i < particles.nodes.length; i++) {
                for (let j = i + 1; j < particles.nodes.length; j++) {
                    const nodeA = particles.nodes[i];
                    const nodeB = particles.nodes[j];

                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = 1 - distance / config.connectionDistance;
                        ctx.strokeStyle = `rgba(210, 0, 197, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        let animationFrame;

        function animate() {
            ctx.fillStyle = "rgba(10, 10, 20, 0.15)";
            ctx.fillRect(0, 0, width, height);

            // Update and draw particles
            particles.data.forEach((p) => {
                p.update();
                p.draw();
            });

            particles.nodes.forEach((n) => {
                n.update();
                n.draw();
            });

            drawConnections();

            animationFrame = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Handle resize
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        />
    );
}

export default CyberParticles;