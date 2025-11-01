"use client";
import React, { useRef, useEffect, useState } from "react";

interface DoublePendulumProps {
  onEntropy?: (data: number[]) => void;
  isActive?: boolean;
}

interface PendulumState {
  theta1: number; // unghi primul pendul
  theta2: number; // unghi al doilea pendul
  omega1: number; // viteză unghiulară 1
  omega2: number; // viteză unghiulară 2
}

export function DoublePendulum({
  onEntropy,
  isActive = true,
}: DoublePendulumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<PendulumState>({
    theta1: Math.PI / 2,
    theta2: Math.PI / 2,
    omega1: 0,
    omega2: 0,
  });
  const trailRef = useRef<{ x: number; y: number; hue: number }[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [stats, setStats] = useState({ energy: 0, chaos: 0 });

  // Parametrii fizici
  const m1 = 10; // masa 1
  const m2 = 10; // masa 2
  const L1 = 100; // lungime 1
  const L2 = 100; // lungime 2
  const g = 0.5; // gravitație
  const damping = 0.9995; // amortizare ușoară

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 3;

    let animationId: number;
    let lastEntropyTime = 0;
    let lastTheta1 = stateRef.current.theta1;

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    const handleClick = () => {
      // Perturbație la click
      stateRef.current.omega1 += (Math.random() - 0.5) * 0.2;
      stateRef.current.omega2 += (Math.random() - 0.5) * 0.2;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    function animate(timestamp: number) {
      if (!ctx || !isActive) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const state = stateRef.current;

      // Ecuațiile lui Lagrange pentru pendul dublu (metoda Runge-Kutta 4)
      const dt = 0.1;

      for (let i = 0; i < 3; i++) {
        // Iterații multiple pentru precizie
        const { theta1, theta2, omega1, omega2 } = state;

        const delta = theta2 - theta1;
        const den1 = (m1 + m2) * L1 - m2 * L1 * Math.cos(delta) * Math.cos(delta);
        const den2 = (L2 / L1) * den1;

        // Accelerații unghiulare
        const alpha1 =
          (m2 * L1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta) +
            m2 * g * Math.sin(theta2) * Math.cos(delta) +
            m2 * L2 * omega2 * omega2 * Math.sin(delta) -
            (m1 + m2) * g * Math.sin(theta1)) /
          den1;

        const alpha2 =
          (-m2 * L2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta) +
            (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta) -
            (m1 + m2) * L1 * omega1 * omega1 * Math.sin(delta) -
            (m1 + m2) * g * Math.sin(theta2)) /
          den2;

        state.omega1 += alpha1 * dt;
        state.omega2 += alpha2 * dt;

        // Interacțiune mouse
        if (mouseRef.current) {
          const x1 = originX + L1 * Math.sin(theta1);
          const y1 = originY + L1 * Math.cos(theta1);
          const dx = mouseRef.current.x - x1;
          const dy = mouseRef.current.y - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50) {
            const force = (50 - dist) / 50;
            state.omega1 += (dx / dist) * force * 0.001;
          }
        }

        // Amortizare
        state.omega1 *= damping;
        state.omega2 *= damping;

        state.theta1 += state.omega1 * dt;
        state.theta2 += state.omega2 * dt;
      }

      // Calculare poziții
      const x1 = originX + L1 * Math.sin(state.theta1);
      const y1 = originY + L1 * Math.cos(state.theta1);
      const x2 = x1 + L2 * Math.sin(state.theta2);
      const y2 = y1 + L2 * Math.cos(state.theta2);

      // Trail
      const hue = ((state.theta1 + state.theta2) * 180) / Math.PI;
      trailRef.current.push({ x: x2, y: y2, hue: hue % 360 });
      if (trailRef.current.length > 500) {
        trailRef.current.shift();
      }

      // Clear
      ctx.fillStyle = "rgba(10, 10, 20, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Desenare trail
      for (let i = 0; i < trailRef.current.length; i++) {
        const point = trailRef.current[i];
        const alpha = i / trailRef.current.length;
        ctx.fillStyle = `hsla(${point.hue}, 80%, 60%, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2 * alpha + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Linie origine -> masa 1
      ctx.strokeStyle = "rgba(150, 150, 200, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Linie masa 1 -> masa 2
      ctx.strokeStyle = "rgba(100, 150, 250, 0.8)";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Masa 1
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, m1);
      grad1.addColorStop(0, "#667eea");
      grad1.addColorStop(1, "#764ba2");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x1, y1, m1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Masa 2
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, m2);
      grad2.addColorStop(0, "#f093fb");
      grad2.addColorStop(1, "#f5576c");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x2, y2, m2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.stroke();

      // Pivot
      ctx.fillStyle = "rgba(200, 200, 220, 0.9)";
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Mouse cursor effect
      if (mouseRef.current) {
        ctx.strokeStyle = "rgba(100, 255, 200, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 50, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Colectare entropie
      if (timestamp - lastEntropyTime > 50) {
        const entropy = [
          Math.floor((x2 % 1) * 255),
          Math.floor((y2 % 1) * 255),
          Math.floor(Math.abs(state.omega1 * 100) % 255),
          Math.floor(Math.abs(state.omega2 * 100) % 255),
          Math.floor(Math.abs(Math.sin(state.theta1 * state.theta2) * 255)),
          Math.floor((timestamp % 256)),
        ];

        onEntropy?.(entropy);
        lastEntropyTime = timestamp;

        // Stats
        const energy =
          0.5 * m1 * (L1 * state.omega1) ** 2 +
          0.5 * m2 * ((L1 * state.omega1) ** 2 + (L2 * state.omega2) ** 2);

        const chaosMetric = Math.abs(state.theta1 - lastTheta1) * 1000;
        lastTheta1 = state.theta1;

        setStats({
          energy: Math.min(100, energy / 10),
          chaos: Math.min(100, chaosMetric),
        });
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, [isActive, onEntropy]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="rounded-xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"
      />
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-mono">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Energy: {stats.energy.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Chaos: {stats.chaos.toFixed(1)}%</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-2 text-white text-xs text-center">
        💡 Move mouse over pendulum • Click to perturb • Let chaos create randomness
      </div>
    </div>
  );
}