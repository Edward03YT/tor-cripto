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
  temp: number; // temperatura blob-ului
}

export function LavaLamp({ seed, hue = 210, onEntropy }: LavaLampProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastEntropySend = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Generator de numere pseudo-random bazat pe seed
    const rand = (n: number) =>
      ((Math.sin(seed * 1000 * n) * 10000) % 1 + 1) % 1;

    // Simplu Perlin-like noise
    const noise = (x: number, y: number, t: number) => {
      return (
        Math.sin(x * 0.01 + t * 0.0003) * 
        Math.cos(y * 0.01 + t * 0.0002) * 0.5 + 0.5
      );
    };

    // Inițializare blob-uri
    if (blobsRef.current.length === 0) {
      blobsRef.current = Array.from({ length: 7 }).map((_, i) => ({
        x: width / 2 + (rand(i) - 0.5) * 60,
        y: height - rand(i + 1) * height * 0.8,
        vx: 0,
        vy: -0.2 - rand(i + 5) * 0.15,
        r: 20 + rand(i + 2) * 35,
        targetR: 20 + rand(i + 2) * 35,
        drift: rand(i + 3) * 2 * Math.PI,
        hueOffset: (rand(i + 4) - 0.5) * 40,
        phase: rand(i + 6) * Math.PI * 2,
        temp: rand(i + 7),
      }));
    }

    const blobs = blobsRef.current;
    let animationId: number;

    // Forma sticlei (mai organică)
    const drawGlass = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.moveTo(width * 0.28, 0);
      ctx.bezierCurveTo(
        width * 0.05, height * 0.15,
        width * 0.12, height * 0.5,
        width * 0.35, height * 0.92
      );
      ctx.bezierCurveTo(
        width * 0.42, height * 1.0,
        width * 0.58, height * 1.0,
        width * 0.65, height * 0.92
      );
      ctx.bezierCurveTo(
        width * 0.88, height * 0.5,
        width * 0.95, height * 0.15,
        width * 0.72, 0
      );
      ctx.closePath();
    };

    // Metaballs pentru fuziune blob-uri
    const metaball = (x: number, y: number, blobs: Blob[]) => {
      let sum = 0;
      for (const b of blobs) {
        const dx = x - b.x;
        const dy = y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.r * 2) {
          sum += (b.r * b.r) / (dist * dist + 1);
        }
      }
      return sum;
    };

    function animate(t: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Fundal gradient pentru lichid
      ctx.save();
      drawGlass(ctx);
      ctx.clip();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, `hsla(${hue}, 40%, 15%, 0.3)`);
      bgGrad.addColorStop(0.5, `hsla(${hue}, 35%, 12%, 0.5)`);
      bgGrad.addColorStop(1, `hsla(${hue + 20}, 45%, 18%, 0.7)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Actualizare fizică blob-uri
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        
        // Fizică: gravitație + plutire bazată pe temperatură
        const buoyancy = 0.3 + b.temp * 0.2;
        b.vy += (buoyancy - 0.5) * 0.02;
        
        // Drift orizontal cu noise
        const driftForce = noise(b.y, t, b.drift) - 0.5;
        b.vx += driftForce * 0.05;
        
        // Fricțiune
        b.vx *= 0.98;
        b.vy *= 0.995;
        
        // Aplicare viteză
        b.x += b.vx + Math.sin(t / 1000 + b.drift) * 0.4;
        b.y += b.vy;
        
        // Deformare blob (pulsare)
        b.r += (b.targetR - b.r) * 0.05;
        b.phase += 0.02;
        const squeeze = Math.sin(b.phase) * 0.1;
        
        // Limite laterale (bounce soft)
        const margin = 30;
        if (b.x - b.r < margin) {
          b.x = margin + b.r;
          b.vx = Math.abs(b.vx) * 0.5;
        }
        if (b.x + b.r > width - margin) {
          b.x = width - margin - b.r;
          b.vx = -Math.abs(b.vx) * 0.5;
        }
        
        // Reset când iese sus/jos
        if (b.y + b.r < -20) {
          b.y = height + b.r + 20;
          b.x = width * 0.5 + (rand(b.r + t) - 0.5) * 50;
          b.vx = 0;
          b.vy = -0.3;
          b.temp = rand(t + i);
          b.targetR = 20 + rand(i + t * 0.001) * 35;
        }
        if (b.y - b.r > height + 20) {
          b.y = -b.r - 20;
          b.x = width * 0.5 + (rand(b.r + t) - 0.5) * 50;
          b.vx = 0;
          b.vy = 0.3;
          b.temp = rand(t + i + 100);
          b.targetR = 20 + rand(i + t * 0.001 + 50) * 35;
        }

        // Interacțiune între blob-uri
        for (let j = i + 1; j < blobs.length; j++) {
          const other = blobs[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.r + other.r;
          
          if (dist < minDist && dist > 0) {
            // Repulsie ușoară
            const force = (minDist - dist) * 0.01;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            b.vx -= fx;
            b.vy -= fy;
            other.vx += fx;
            other.vy += fy;
          }
        }
      }

      // Desenare blob-uri cu efect metaball
      ctx.globalCompositeOperation = "lighter";
      
      for (const b of blobs) {
        const actualR = b.r * (1 + Math.sin(b.phase) * 0.08);
        
        // Shadow/glow
        const glowGrad = ctx.createRadialGradient(
          b.x, b.y, 0, 
          b.x, b.y, actualR * 1.5
        );
        const actualHue = (hue + b.hueOffset + Math.sin(t / 3000 + b.phase) * 15) % 360;
        
        glowGrad.addColorStop(0, `hsla(${actualHue}, 95%, 65%, 0.9)`);
        glowGrad.addColorStop(0.4, `hsla(${actualHue}, 90%, 55%, 0.7)`);
        glowGrad.addColorStop(0.7, `hsla(${actualHue - 10}, 85%, 45%, 0.3)`);
        glowGrad.addColorStop(1, "transparent");

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        
        // Deformare eliptică bazată pe mișcare
        const stretchX = 1 + Math.abs(b.vx) * 0.3;
        const stretchY = 1 + Math.abs(b.vy) * 0.2;
        
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(stretchX, stretchY);
        ctx.arc(0, 0, actualR, 0, 2 * Math.PI);
        ctx.restore();
        ctx.fill();

        // Highlight
        const highlightGrad = ctx.createRadialGradient(
          b.x - actualR * 0.3, 
          b.y - actualR * 0.3, 
          0,
          b.x - actualR * 0.3, 
          b.y - actualR * 0.3, 
          actualR * 0.6
        );
        highlightGrad.addColorStop(0, `hsla(${actualHue}, 100%, 85%, 0.6)`);
        highlightGrad.addColorStop(1, "transparent");
        
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(
          b.x - actualR * 0.25, 
          b.y - actualR * 0.25, 
          actualR * 0.4, 
          0, 2 * Math.PI
        );
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Reflexie pe sticlă
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 3;
      drawGlass(ctx);
      ctx.stroke();

      // Highlight sticlă (stânga)
      const glassHighlight = ctx.createLinearGradient(0, 0, width * 0.3, 0);
      glassHighlight.addColorStop(0, "rgba(255, 255, 255, 0)");
      glassHighlight.addColorStop(0.5, "rgba(255, 255, 255, 0.25)");
      glassHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = glassHighlight;
      ctx.beginPath();
      ctx.moveTo(width * 0.15, height * 0.1);
      ctx.quadraticCurveTo(width * 0.2, height * 0.5, width * 0.25, height * 0.9);
      ctx.lineTo(width * 0.22, height * 0.9);
      ctx.quadraticCurveTo(width * 0.17, height * 0.5, width * 0.12, height * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Bază (cu lumină)
      const baseGrad = ctx.createLinearGradient(0, height, 0, height * 1.15);
      baseGrad.addColorStop(0, "rgba(50, 50, 55, 1)");
      baseGrad.addColorStop(0.5, "rgba(35, 35, 40, 1)");
      baseGrad.addColorStop(1, "rgba(25, 25, 30, 1)");
      
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height);
      ctx.lineTo(width * 0.75, height);
      ctx.lineTo(width * 0.6, height * 1.15);
      ctx.lineTo(width * 0.4, height * 1.15);
      ctx.closePath();
      ctx.fill();

      // Lumină bec în bază
      const bulbGlow = ctx.createRadialGradient(
        width * 0.5, height * 1.05, 0,
        width * 0.5, height * 1.05, 30
      );
      bulbGlow.addColorStop(0, `hsla(${hue + 30}, 100%, 60%, 0.4)`);
      bulbGlow.addColorStop(0.5, `hsla(${hue + 20}, 90%, 50%, 0.2)`);
      bulbGlow.addColorStop(1, "transparent");
      
      ctx.fillStyle = bulbGlow;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 1.05, 25, 0, 2 * Math.PI);
      ctx.fill();

      // Capac superior
      const capGrad = ctx.createLinearGradient(0, -height * 0.2, 0, 0);
      capGrad.addColorStop(0, "rgba(40, 40, 45, 1)");
      capGrad.addColorStop(0.6, "rgba(55, 55, 60, 1)");
      capGrad.addColorStop(1, "rgba(45, 45, 50, 1)");
      
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.28, 0);
      ctx.lineTo(width * 0.72, 0);
      ctx.lineTo(width * 0.62, -height * 0.18);
      ctx.lineTo(width * 0.38, -height * 0.18);
      ctx.closePath();
      ctx.fill();

      // Highlight capac
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(width * 0.38, -height * 0.18);
      ctx.lineTo(width * 0.45, -height * 0.18);
      ctx.lineTo(width * 0.4, 0);
      ctx.lineTo(width * 0.33, 0);
      ctx.closePath();
      ctx.fill();

      // Entropie
      const now = performance.now();
      if (onEntropy && now - lastEntropySend.current > 500) {
        const chunk = blobs.map((b) => 
          Math.floor((b.x * b.y + b.vx * 1000 + b.vy * 1000) % 256)
        );
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
      width={160}
      height={340}
      style={{
        background: "linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(40, 40, 60, 0.6))",
        borderRadius: "12px",
        margin: "10px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)",
      }}
    />
  );
}