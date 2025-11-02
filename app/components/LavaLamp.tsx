"use client";
import React, { useRef, useEffect } from "react";

export interface LavaLampProps {
  seed: number;
  hue?: number;
  onEntropy?: (entropyChunk: number[]) => void;
}

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  targetR: number;
  drift: number;
  hueOffset: number;
  phase: number;
  temp: number;
  density: number;
  viscosity: number;
}

export function LavaLamp({ seed, hue = 210, onEntropy }: LavaLampProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastEntropySend = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);
  const entropyBuffer = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const rand = (n: number) => ((Math.sin(seed * 1000 * n) * 10000) % 1 + 1) % 1;

    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.008 + t * 0.0002) * Math.cos(y * 0.008 + t * 0.00015) * 0.5 + 0.5;
    };

    if (blobsRef.current.length === 0) {
      blobsRef.current = Array.from({ length: 5 }).map((_, i) => ({
        x: width / 2 + (rand(i) - 0.5) * 40,
        y: height * 0.7 - rand(i + 1) * height * 0.4,
        vx: 0,
        vy: 0,
        r: 25 + rand(i + 2) * 30,
        targetR: 25 + rand(i + 2) * 30,
        drift: rand(i + 3) * 2 * Math.PI,
        hueOffset: (rand(i + 4) - 0.5) * 20,
        phase: rand(i + 6) * Math.PI * 2,
        temp: rand(i + 7) * 0.7 + 0.3,
        density: 0.5 + rand(i + 8) * 0.5,
        viscosity: 0.95 + rand(i + 9) * 0.03,
      }));
    }

    const blobs = blobsRef.current;
    let animationId: number;

    const drawBottle = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height * 0.05);
      ctx.bezierCurveTo(
        width * 0.15, height * 0.18,
        width * 0.18, height * 0.55,
        width * 0.32, height * 0.88
      );
      ctx.bezierCurveTo(
        width * 0.38, height * 0.94,
        width * 0.62, height * 0.94,
        width * 0.68, height * 0.88
      );
      ctx.bezierCurveTo(
        width * 0.82, height * 0.55,
        width * 0.85, height * 0.18,
        width * 0.68, height * 0.05
      );
      ctx.closePath();
    };

    function animate(t: number) {
      if (!ctx) return;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#1a1a2e");
      bgGrad.addColorStop(1, "#0f0f1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Bottle clip
      ctx.save();
      drawBottle(ctx);
      ctx.clip();

      // Liquid background
      const liquidGrad = ctx.createLinearGradient(0, 0, 0, height);
      liquidGrad.addColorStop(0, `hsla(${hue}, 25%, 8%, 1)`);
      liquidGrad.addColorStop(0.5, `hsla(${hue}, 30%, 10%, 1)`);
      liquidGrad.addColorStop(1, `hsla(${hue + 15}, 35%, 12%, 1)`);
      ctx.fillStyle = liquidGrad;
      ctx.fillRect(0, 0, width, height);

      // Physics simulation
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        
        // Temperature-based buoyancy (hot blobs rise)
        const buoyancyForce = (b.temp - 0.5) * 0.025;
        b.vy += buoyancyForce;
        
        // Gravity
        b.vy += 0.008 * b.density;
        
        // Horizontal drift with Perlin-like noise
        const driftNoise = noise(b.y, t * 0.5, b.drift);
        b.vx += (driftNoise - 0.5) * 0.03;
        
        // Viscosity (fluid resistance)
        b.vx *= b.viscosity;
        b.vy *= 0.992;
        
        // Apply velocity
        b.x += b.vx + Math.sin(t * 0.0008 + b.drift) * 0.25;
        b.y += b.vy;
        
        // Organic pulsing
        b.phase += 0.015 + b.temp * 0.01;
        const pulseFactor = Math.sin(b.phase) * 0.12;
        b.r += (b.targetR * (1 + pulseFactor) - b.r) * 0.08;
        
        // Temperature change (cooling/heating cycle)
        b.temp += (Math.sin(t * 0.0003 + b.drift * 2) * 0.001);
        b.temp = Math.max(0.2, Math.min(0.95, b.temp));
        
        // Wall collisions with soft bounce
        const margin = 35;
        if (b.x - b.r < margin) {
          b.x = margin + b.r;
          b.vx = Math.abs(b.vx) * 0.3;
        }
        if (b.x + b.r > width - margin) {
          b.x = width - margin - b.r;
          b.vx = -Math.abs(b.vx) * 0.3;
        }
        
        // Loop when leaving bounds
        if (b.y + b.r < -30) {
          b.y = height + b.r + 20;
          b.x = width * 0.5 + (rand(t * 0.001 + i) - 0.5) * 40;
          b.vx = 0;
          b.vy = 0;
          b.temp = rand(t * 0.001 + i + 50) * 0.7 + 0.3;
          b.targetR = 25 + rand(t * 0.001 + i + 100) * 30;
        }
        if (b.y - b.r > height + 30) {
          b.y = -b.r - 20;
          b.x = width * 0.5 + (rand(t * 0.001 + i + 200) - 0.5) * 40;
          b.vx = 0;
          b.vy = 0;
          b.temp = rand(t * 0.001 + i + 250) * 0.3 + 0.1;
          b.targetR = 25 + rand(t * 0.001 + i + 300) * 30;
        }

        // Blob interactions (merging/splitting behavior)
        for (let j = i + 1; j < blobs.length; j++) {
          const other = blobs[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (b.r + other.r) * 0.8;
          
          if (dist < minDist && dist > 0.1) {
            const overlap = minDist - dist;
            const force = overlap * 0.008;
            const nx = dx / dist;
            const ny = dy / dist;
            
            b.vx -= nx * force;
            b.vy -= ny * force;
            other.vx += nx * force;
            other.vy += ny * force;
            
            // Temperature exchange
            const tempDiff = (other.temp - b.temp) * 0.01;
            b.temp += tempDiff;
            other.temp -= tempDiff;
          }
        }
        
        // Collect entropy from chaotic motion
        entropyBuffer.current.push(
          Math.floor((b.x * 1000 + b.y * 1000 + b.vx * 10000 + b.vy * 10000 + t * 0.1) % 256)
        );
      }

      // Draw blobs with realistic glow
      ctx.globalCompositeOperation = "lighter";
      
      for (const b of blobs) {
        const stretchX = 1 + Math.abs(b.vx) * 0.4;
        const stretchY = 1 + Math.abs(b.vy) * 0.3;
        const actualR = b.r;
        
        // Core blob
        const coreGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, actualR * 1.2);
        const tempHue = hue + b.hueOffset + (b.temp - 0.5) * 30;
        const brightness = 40 + b.temp * 30;
        
        coreGrad.addColorStop(0, `hsla(${tempHue}, 100%, ${brightness + 20}%, 1)`);
        coreGrad.addColorStop(0.3, `hsla(${tempHue}, 95%, ${brightness + 10}%, 0.9)`);
        coreGrad.addColorStop(0.6, `hsla(${tempHue - 10}, 90%, ${brightness}%, 0.6)`);
        coreGrad.addColorStop(1, `hsla(${tempHue - 20}, 85%, ${brightness - 10}%, 0)`);

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(stretchX, stretchY);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, actualR * 1.2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // Highlight
        const hlGrad = ctx.createRadialGradient(
          b.x - actualR * 0.35, b.y - actualR * 0.35, 0,
          b.x - actualR * 0.35, b.y - actualR * 0.35, actualR * 0.5
        );
        hlGrad.addColorStop(0, `hsla(${tempHue + 20}, 100%, 90%, 0.5)`);
        hlGrad.addColorStop(1, "transparent");
        ctx.fillStyle = hlGrad;
        ctx.beginPath();
        ctx.arc(b.x - actualR * 0.3, b.y - actualR * 0.3, actualR * 0.4, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Glass bottle with realistic reflection
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 2;
      drawBottle(ctx);
      ctx.stroke();
      ctx.restore();

      // Left highlight on glass
      const glassHL = ctx.createLinearGradient(width * 0.2, 0, width * 0.35, 0);
      glassHL.addColorStop(0, "rgba(255, 255, 255, 0)");
      glassHL.addColorStop(0.4, "rgba(255, 255, 255, 0.2)");
      glassHL.addColorStop(0.6, "rgba(255, 255, 255, 0.15)");
      glassHL.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = glassHL;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.1);
      ctx.quadraticCurveTo(width * 0.24, height * 0.5, width * 0.28, height * 0.85);
      ctx.lineTo(width * 0.25, height * 0.85);
      ctx.quadraticCurveTo(width * 0.21, height * 0.5, width * 0.17, height * 0.1);
      ctx.closePath();
      ctx.fill();

      // Metal base
      const baseGrad = ctx.createLinearGradient(0, height * 0.88, 0, height);
      baseGrad.addColorStop(0, "#3a3a45");
      baseGrad.addColorStop(0.3, "#2a2a35");
      baseGrad.addColorStop(0.7, "#1a1a25");
      baseGrad.addColorStop(1, "#0f0f18");
      
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.28, height * 0.88);
      ctx.lineTo(width * 0.72, height * 0.88);
      ctx.lineTo(width * 0.65, height);
      ctx.lineTo(width * 0.35, height);
      ctx.closePath();
      ctx.fill();

      // Bulb glow at base
      const bulbGlow = ctx.createRadialGradient(width * 0.5, height * 0.94, 0, width * 0.5, height * 0.94, 25);
      bulbGlow.addColorStop(0, `hsla(${hue + 25}, 100%, 55%, 0.6)`);
      bulbGlow.addColorStop(0.5, `hsla(${hue + 15}, 95%, 45%, 0.3)`);
      bulbGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bulbGlow;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.94, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Metal cap
      const capGrad = ctx.createLinearGradient(0, 0, 0, height * 0.08);
      capGrad.addColorStop(0, "#2a2a35");
      capGrad.addColorStop(0.5, "#3a3a45");
      capGrad.addColorStop(1, "#2a2a35");
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height * 0.05);
      ctx.lineTo(width * 0.68, height * 0.05);
      ctx.lineTo(width * 0.6, 0);
      ctx.lineTo(width * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Cap highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.moveTo(width * 0.4, 0);
      ctx.lineTo(width * 0.48, 0);
      ctx.lineTo(width * 0.44, height * 0.05);
      ctx.lineTo(width * 0.36, height * 0.05);
      ctx.closePath();
      ctx.fill();

      // Send entropy (Cloudflare-style chaos sampling)
      const now = performance.now();
      if (onEntropy && now - lastEntropySend.current > 100 && entropyBuffer.current.length >= 16) {
        const chunk = entropyBuffer.current.splice(0, 16);
        onEntropy(chunk);
        lastEntropySend.current = now;
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [seed, hue, onEntropy]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={380}
      style={{
        background: "radial-gradient(circle at 30% 40%, rgba(30, 30, 50, 0.8), rgba(15, 15, 25, 0.95))",
        borderRadius: "16px",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.03)",
      }}
    />
  );
}