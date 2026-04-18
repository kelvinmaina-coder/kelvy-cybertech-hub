import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  connections: number[];
}

const NeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<Point[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create neural points
    const numPoints = 150;
    const points: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.2,
        connections: []
      });
    }

    // Pre-calculate connections (closest points)
    for (let i = 0; i < numPoints; i++) {
      const distances: { idx: number; dist: number }[] = [];
      for (let j = 0; j < numPoints; j++) {
        if (i === j) continue;
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        distances.push({ idx: j, dist });
      }
      distances.sort((a, b) => a.dist - b.dist);
      points[i].connections = distances.slice(0, 4).map(d => d.idx);
    }
    pointsRef.current = points;

    // Colors based on theme
    const getColors = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark') ||
                     localStorage.getItem('theme') !== 'light';
      return {
        pointGlow: isDark ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 200, 100, 0.3)',
        pointCore: isDark ? '#00ff88' : '#00aa55',
        lineGlow: isDark ? 'rgba(0, 255, 136, 0.06)' : 'rgba(0, 200, 100, 0.06)',
        lineBright: isDark ? 'rgba(0, 255, 136, 0.14)' : 'rgba(0, 200, 100, 0.14)',
        mouseGlow: isDark ? 'rgba(0, 255, 136, 0.14)' : 'rgba(0, 200, 100, 0.14)'
      };
    };

    let colors = getColors();
    const observer = new MutationObserver(() => { colors = getColors(); });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update colors
      colors = getColors();

      // Update point positions
      for (const point of pointsRef.current) {
        point.x += point.vx;
        point.y += point.vy;
        point.z += point.vz;

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
        if (point.z < 0 || point.z > 100) point.vz *= -1;

        // Clamp positions
        point.x = Math.max(0, Math.min(canvas.width, point.x));
        point.y = Math.max(0, Math.min(canvas.height, point.y));
        point.z = Math.max(0, Math.min(100, point.z));
      }

      // Draw connections
      for (const point of pointsRef.current) {
        for (const connectedIdx of point.connections) {
          const other = pointsRef.current[connectedIdx];
          if (!other) continue;
          
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const opacity = Math.max(0, 1 - dist / 150) * 0.25;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            
            // Mouse interaction - subtle line glow near cursor
            const mouseDist = Math.hypot(point.x - mouseRef.current.x, point.y - mouseRef.current.y);
            const isNearMouse = mouseDist < 120;
            const lineColor = isNearMouse ? colors.lineBright : colors.lineGlow;
            
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = isNearMouse ? 1.1 : 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw points with glow effect
      for (const point of pointsRef.current) {
        const size = 2 + (point.z / 100) * 4;
        const mouseDist = Math.hypot(point.x - mouseRef.current.x, point.y - mouseRef.current.y);
        const isNearMouse = mouseDist < 100;
        const glowSize = isNearMouse ? size + 3 : size + 1.5;
        const glowOpacity = isNearMouse ? 0.26 : 0.14;

        // Outer glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = colors.pointGlow;
        ctx.globalAlpha = glowOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Inner glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors.pointCore;
        ctx.fill();

        // Mouse attraction - slight pull toward cursor
        if (isNearMouse && mouseDist > 10) {
          const angle = Math.atan2(mouseRef.current.y - point.y, mouseRef.current.x - point.x);
          point.vx += Math.cos(angle) * 0.02;
          point.vy += Math.sin(angle) * 0.02;
        }

        // Damping
        point.vx *= 0.99;
        point.vy *= 0.99;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.45
      }}
    />
  );
};

export default NeuralNetworkBackground;
