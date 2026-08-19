'use client';

import React, { useEffect, useRef } from 'react';

export const GridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    const resize = () => {
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    const resizeObserver = new ResizeObserver(() => {
      const newHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      if (Math.abs(newHeight - height) > 50) {
        height = newHeight;
        canvas.height = height;
      }
    });
    resizeObserver.observe(document.body);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      
      // Increased line opacity for crisp visibility
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.07)';
      const accentGlow = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.08)';
      const boxColor = isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(5, 150, 105, 0.2)';
      const spacing = 64;

      // 1. Draw grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw mouse-following interactive radial glow
      const scrollY = window.scrollY;
      const mx = mouseRef.current.x * width;
      const my = mouseRef.current.y * window.innerHeight + scrollY;

      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 450);
      gradient.addColorStop(0, accentGlow);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(mx - 450, my - 450, 900, 900);

      // 3. Draw 3D Spatial Wireframe Cubes
      const boxPositions = [
        { x: width * 0.12, y: 400, size: 55 },
        { x: width * 0.86, y: 1100, size: 45 },
        { x: width * 0.08, y: 2200, size: 50 },
        { x: width * 0.89, y: 3200, size: 55 },
        { x: width * 0.15, y: 4400, size: 40 },
      ];

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1.2;

      boxPositions.forEach(({ x, y, size }) => {
        if (y < height + 100) {
          const offset = size * 0.35;
          // Front face
          ctx.strokeRect(x, y, size, size);
          // Back face
          ctx.strokeRect(x + offset, y - offset, size, size);
          // Connecting depth edges
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + offset, y - offset);
          ctx.moveTo(x + size, y); ctx.lineTo(x + size + offset, y - offset);
          ctx.moveTo(x, y + size); ctx.lineTo(x + offset, y + size - offset);
          ctx.moveTo(x + size, y + size); ctx.lineTo(x + size + offset, y + size - offset);
          ctx.stroke();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      aria-hidden="true"
    />
  );
};
