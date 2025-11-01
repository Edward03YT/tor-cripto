"use client";
import React, { useEffect, useRef } from "react";

interface EntropyVisualizerProps {
  entropyLevel: number;
  poolStats: {
    mean: number;
    variance: number;
    entropy: number;
  };
}

export function EntropyVisualizer({
  entropyLevel,
  poolStats,
}: EntropyVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
    ctx.fillRect(0, 0, width, height);

    // Entropy bar
    const barHeight = 30;
    const barY = height / 2 - barHeight / 2;

    // Background bar
    ctx.fillStyle = "rgba(50, 50, 70, 0.5)";
    ctx.fillRect(10, barY, width - 20, barHeight);

    // Filled bar
    const gradient = ctx.createLinearGradient(10, 0, width - 10, 0);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(0.5, "#764ba2");
    gradient.addColorStop(1, "#f093fb");

    ctx.fillStyle = gradient;
    const fillWidth = ((width - 20) * entropyLevel) / 100;
    ctx.fillRect(10, barY, fillWidth, barHeight);

    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#667eea";
    ctx.fillRect(10, barY, fillWidth, barHeight);
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, barY, width - 20, barHeight);

    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${entropyLevel.toFixed(1)}%`, width / 2, barY + barHeight + 20);

    // Particles based on entropy
    const particleCount = Math.floor(entropyLevel / 2);
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [entropyLevel, poolStats]);

  const getStatusColor = () => {
    if (entropyLevel < 30) return "text-red-400";
    if (entropyLevel < 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusText = () => {
    if (entropyLevel < 30) return "LOW - Keep moving!";
    if (entropyLevel < 70) return "MEDIUM - Almost there...";
    return "HIGH - Ready to generate!";
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="rounded-lg border border-gray-700"
      />
      <div className={`text-center font-mono text-sm font-bold ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-gray-400">
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-gray-500">Mean</div>
          <div className="text-white">{poolStats.mean.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-gray-500">Variance</div>
          <div className="text-white">{poolStats.variance.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-gray-500">S.Entropy</div>
          <div className="text-white">{poolStats.entropy.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}