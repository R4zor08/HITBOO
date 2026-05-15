import { useEffect, useRef } from 'react';

type ParticleBackgroundProps = {
  /** When true, draw a static frame once (no animation loop). */
  reduceMotion?: boolean;
};

export function ParticleBackground({
  reduceMotion = false
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }> = [];
    const colors = ['#00f0ff', '#ff00e5', '#8b5cf6', '#ffffff'];

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor(
        (canvas.width * canvas.height) / 12000
      );
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const resizeStatic = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      drawStaticFrame();
    };

    const resizeAnimated = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        
        // Enhanced glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(draw);
    };

    if (reduceMotion) {
      window.addEventListener('resize', resizeStatic);
      resizeStatic();
      return () => {
        window.removeEventListener('resize', resizeStatic);
      };
    }

    window.addEventListener('resize', resizeAnimated);
    resizeAnimated();
    draw();
    return () => {
      window.removeEventListener('resize', resizeAnimated);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] opacity-70"
    />
  );
}
