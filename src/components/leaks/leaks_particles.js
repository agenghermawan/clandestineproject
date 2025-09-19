import {useEffect, useRef} from "react";

export default function LeaksParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Setup Canvas Properly
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth * devicePixelRatio);
        let height = (canvas.height = window.innerHeight * devicePixelRatio);
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // 2. Enhanced Configuration
        const config = {
            particleCount: 100,
            connectionDistance: 150,
            colors: {
                primary: "#ff2a6d",
                secondary: "#05d9e8",
                tertiary: "#d300c5",
                background: "rgba(10, 10, 20, 0.15)",
            },
            particleTypes: ["email", "password", "hash", "ip"],
        };

        // 3. Improved Particle System
        class DataParticle {
            constructor() {
                this.type =
                    config.particleTypes[
                        Math.floor(Math.random() * config.particleTypes.length)
                        ];
                this.reset();
                this.velocity = 0.5 + Math.random() * 3;
                this.size = 2 + Math.random() * 4;
                this.char = this.getCharacter();
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            }

            getCharacter() {
                switch (this.type) {
                    case "email":
                        return "@";
                    case "password":
                        return "•";
                    case "ip":
                        return Math.floor(Math.random() * 10);
                    default:
                        return String.fromCharCode(
                            Math.random() > 0.5
                                ? 48 + Math.floor(Math.random() * 10)
                                : 97 + Math.floor(Math.random() * 26)
                        );
                }
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100;
                this.alpha = 0.1 + Math.random() * 0.9;
                this.targetX = this.x + (Math.random() - 0.5) * 50;
            }

            update() {
                // Smooth movement
                this.x += (this.targetX - this.x) * 0.05;
                this.y -= this.velocity;
                this.rotation += this.rotationSpeed;

                if (this.y < -20) this.reset();
                if (Math.random() < 0.01) this.char = this.getCharacter();
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                ctx.font = `${this.size}px 'Fira Code', monospace`;
                ctx.fillStyle =
                    this.type === "email"
                        ? `rgba(255, 42, 109, ${this.alpha})`
                        : `rgba(5, 217, 232, ${this.alpha})`;

                ctx.fillText(this.char, 0, 0);
                ctx.restore();
            }
        }

        // 4. Enhanced Network Nodes
        class NetworkNode {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseSize = 3 + Math.random() * 5;
                this.pulseSpeed = 0.01 + Math.random() * 0.05;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.connections = [];
            }

            update() {
                this.pulsePhase += this.pulseSpeed;
                this.connections = [];
            }

            draw() {
                const pulseSize = this.baseSize * (1 + Math.sin(this.pulsePhase) * 0.7);

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    this.x,
                    this.y,
                    0,
                    this.x,
                    this.y,
                    pulseSize * 4
                );
                gradient.addColorStop(0, config.colors.secondary);
                gradient.addColorStop(1, "rgba(5, 217, 232, 0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.fillStyle = config.colors.primary;
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 5. Initialize Particles with Better Distribution
        const particles = {
            data: Array.from(
                {length: config.particleCount},
                () => new DataParticle()
            ),
            nodes: Array.from({length: 15}, (_, i) => {
                const node = new NetworkNode();
                // Distribute nodes more evenly
                node.x = width * (0.1 + (0.8 * (i % 5)) / 4);
                node.y = height * (0.1 + (0.8 * Math.floor(i / 5)) / 2);
                return node;
            }),
        };

        // 6. Improved Connection Drawing
        function drawConnections() {
            particles.nodes.forEach((node) => {
                particles.data.forEach((particle) => {
                    const dx = node.x - particle.x;
                    const dy = node.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = 0.3 * (1 - distance / config.connectionDistance);
                        ctx.strokeStyle = `rgba(210, 0, 197, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(particle.x, particle.y);
                        ctx.stroke();
                    }
                });
            });
        }

        // 7. Robust Animation Loop
        let animationFrame;
        let lastTime = 0;
        const fps = 60;
        const interval = 1000 / fps;

        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;

            if (delta > interval) {
                ctx.fillStyle = config.colors.background;
                ctx.fillRect(0, 0, width, height);

                drawConnections();

                particles.data.forEach((p) => p.update());
                particles.nodes.forEach((n) => n.update());

                particles.nodes.forEach((n) => n.draw());
                particles.data.forEach((p) => p.draw());

                lastTime = timestamp - (delta % interval);
            }

            animationFrame = requestAnimationFrame(animate);
        }

        animationFrame = requestAnimationFrame(animate);

        // 8. Proper Cleanup
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
            style={{
                transform: "translateZ(0)",
                willChange: "transform",
            }}
        />
    );
}
