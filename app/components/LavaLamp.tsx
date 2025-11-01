"use client";
import React, { useRef, useEffect } from "react";

interface LavaLampProps {
    seed: number;
    hue?: number; // putem schimba culoarea per lampa
    onEntropy?: (entropyChunk: number[]) => void; 
}

interface Blob {
    x: number;
    y: number;
    r: number;
    drift: number;
    hueOffset: number;
    speed: number;
}

export function LavaLamp({ seed, hue = 20 }: LavaLampProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const rand = (n: number) =>
            ((Math.sin(seed * 1000 * n) * 10000) % 1 + 1) % 1;

        // generăm 6 bulgări de lavă
        const blobs: Blob[] = Array.from({ length: 6 }).map((_, i) => ({
            x: width / 2 + (rand(i) - 0.5) * 60,
            y: height - rand(i + 1) * height,
            r: 30 + rand(i + 2) * 30,
            drift: rand(i + 3) * 2 * Math.PI,
            hueOffset: rand(i + 4) * 60,
            speed: 0.2 + rand(i + 5) * 0.15,
        }));

        ctx.filter = "blur(20px)"; // lava moale
        let animationId: number;

        const drawShape = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.moveTo(width * 0.3, 0);
            ctx.quadraticCurveTo(
                width * 0.1,
                height * 0.4,
                width * 0.4,
                height * 0.9
            );
            ctx.quadraticCurveTo(
                width * 0.5,
                height * 1.05,
                width * 0.6,
                height * 0.9
            );
            ctx.quadraticCurveTo(
                width * 0.9,
                height * 0.4,
                width * 0.7,
                0
            );
            ctx.closePath();
        };

        function animate(t: number) {
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);
            ctx.save();

            drawShape(ctx);
            ctx.clip();

            for (const b of blobs) {
                b.y -= b.speed;
                if (b.y + b.r < 0) {
                    b.y = height + b.r;
                    b.x = width * 0.4 + Math.sin(rand(b.r) * 100) * 30;
                }
                b.x += Math.sin(t / 1000 + b.drift) * 0.3;

                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                const actualHue = (hue + b.hueOffset + (Math.sin(t / 3000) * 20)) % 360;
                grad.addColorStop(0, `hsl(${actualHue}, 90%, 55%)`);
                grad.addColorStop(1, "transparent");

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
                ctx.fill();
            }

            // sticlă + reflexii
            ctx.restore();
            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 2;
            drawShape(ctx);
            ctx.stroke();

            const reflection = ctx.createLinearGradient(0, 0, width, 0);
            reflection.addColorStop(0.1, "rgba(255,255,255,0.15)");
            reflection.addColorStop(0.25, "rgba(255,255,255,0)");
            ctx.fillStyle = reflection;
            ctx.fillRect(0, 0, width, height);

            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [seed, hue]);

    return (
        <canvas
            ref={canvasRef}
            width={160}
            height={300}
            style={{
                background: "rgba(10,10,10,0.8)",
                borderRadius: "60px",
                boxShadow:
                    "0 0 25px rgba(255,100,0,0.5), inset 0 0 10px rgba(255,255,255,0.1)",
            }}
        />
    );
}