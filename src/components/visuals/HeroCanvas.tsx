"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** twinkle phase */
  phase: number;
}

/**
 * Lightweight canvas particle network — orange nodes + connection lines.
 * Drifts gently and reacts to mouse with subtle repulsion.
 * Pauses when off-screen and honors prefers-reduced-motion.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    // Create particles, density scaled by area
    const density = 1 / 14000;
    const count = Math.max(40, Math.min(110, Math.floor(width * height * density)));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const mouse = { x: -1e4, y: -1e4, active: false };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    const target = canvas.parentElement ?? canvas;
    target.addEventListener("mousemove", onMove);
    target.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    // Only animate while in viewport
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    let raf = 0;
    const CONNECT = 150;
    const PULL = 170;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;

      ctx.clearRect(0, 0, width, height);

      // Update + mouse interaction
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.015;
        }
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < PULL && d > 0) {
            const force = ((PULL - d) / PULL) * 1.8;
            p.x += (dx / d) * force;
            p.y += (dy / d) * force;
          }
        }
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT * CONNECT) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / CONNECT) * 0.42;
            ctx.strokeStyle = `rgba(242,160,58,${alpha})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Particle dots + glow
      for (const p of particles) {
        const twinkle = (Math.sin(p.phase) + 1) * 0.5; // 0..1
        const coreA = 0.65 + 0.35 * twinkle;
        const glowA = 0.18 + 0.12 * twinkle;

        ctx.fillStyle = `rgba(242,160,58,${glowA})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,210,150,${coreA})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      target.removeEventListener("mousemove", onMove);
      target.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
