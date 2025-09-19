'use client';

import { useEffect, useRef } from 'react';

export default function DarkWebGlobe() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Cyber-themed particles with different types
        const particles = [];
        const particleCount = 150; // Increased for denser network effect

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8; // Faster movement
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 1.5 + 0.5; // Varied sizes
                this.type = Math.floor(Math.random() * 3); // 0=node, 1=data, 2=threat
                this.pulse = Math.random() * Math.PI * 2;
            }

            move() {
                // Simulate network traffic patterns
                this.x += this.vx * (0.5 + Math.abs(Math.sin(this.pulse)) * 0.5);
                this.y += this.vy * (0.5 + Math.abs(Math.cos(this.pulse)) * 0.5);
                this.pulse += 0.02;

                // Bounce with momentum preservation
                if (this.x < 0 || this.x > width) this.vx *= -0.9;
                if (this.y < 0 || this.y > height) this.vy *= -0.9;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

                // Color coding based on particle type
                switch(this.type) {
                    case 0: // Network nodes
                        ctx.fillStyle = `rgba(240, 50, 98, ${0.8})`; // #f03262
                        break;
                    case 1: // Data packets
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.6})`;
                        this.radius = 1;
                        break;
                    case 2: // Threats
                        ctx.fillStyle = `rgba(216, 42, 86, ${0.9})`; // #d82a56
                        this.radius = 2;
                        break;
                }
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function connectParticles() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only connect nearby particles
                    if (distance < 150) {
                        ctx.beginPath();

                        // Connection styling based on particle types
                        if (particles[a].type === 2 || particles[b].type === 2) {
                            // Threat connections
                            ctx.strokeStyle = `rgba(216, 42, 86, ${1 - distance/150})`;
                            ctx.lineWidth = 0.8;
                        } else {
                            // Normal connections
                            ctx.strokeStyle = `rgba(240, 50, 98, ${0.7 - distance/200})`;
                            ctx.lineWidth = 0.5;
                        }

                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            // Dark web-style background
            ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.move();
                p.draw();
            });

            connectParticles();
            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full -z-10 opacity-90"
        ></canvas>
    );
}
