"use client";
import { useEffect, useRef } from "react";

// Simple modern particles using canvas (can be improved/adjusted for VA theme)
export default function VAParticles() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      r: 1.6 + Math.random() * 2.2,
      color: ["#f03262", "#f8deff", "#d946ef", "#3336f0", "#7c3aed"][Math.floor(Math.random() * 5)]
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color + "cc";
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Move
        p.x += p.vx;
        p.y += p.vy;
        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      // Lines between close particles (subtle)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "#f0326233";
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
      <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none -z-10"
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
          aria-hidden="true"
      />
  );
}