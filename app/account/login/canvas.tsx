'use client';

import React, { useRef, useEffect } from 'react';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const col = (x: number, y: number, r: number, g: number, b: number) => {
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    };

    const R = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
    };

    const G = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300));
    };

    const B = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.sin(5 * Math.sin(t / 9) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100));
    };

    let t = 0;

    const run = () => {
      for (let x = 0; x <= 35; x++) {
        for (let y = 0; y <= 35; y++) {
          col(x, y, R(x, y, t), G(x, y, t), B(x, y, t));
        }
      }
      t += 0.05;
      animationFrameRef.current = window.requestAnimationFrame(run);
    };

    run();

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} width={32} height={12} className="hidden md:block max-w-full h-full opacity-65" />;
}
