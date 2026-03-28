
import React, { useRef, useEffect, useCallback } from 'react';
import { SimulationParams, PALETTES } from '../types';

interface Props {
  params: SimulationParams;
}

const SimulationCanvas: React.FC<Props> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{x: number, y: number, z: number, color: string}[]>([]);
  const pathRef = useRef<{x: number, y: number, z: number}[]>([]); // 存储主粒子的历史轨迹
  const requestRef = useRef<number>(null);
  const internalParamsRef = useRef({ ...params });

  useEffect(() => {
    internalParamsRef.current = { ...params };
  }, [params]);

  useEffect(() => {
    const particles = [];
    const colors = PALETTES[params.palette];
    const count = 300; 
    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1.1,
        y: (Math.random() - 0.5) * 1.1,
        z: (Math.random() - 0.5) * 1.1 + (params.type === 'aizawa' ? 0.1 : 0),
        color: colors[i % colors.length]
      });
    }
    particlesRef.current = particles;
    pathRef.current = []; // 切换类型或重置时清空路径
    
    // 立即清空画布，让重置感更强
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [params.type, params.palette, params.resetSignal]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;
    const time = Date.now() * 0.001;
    
    if (params.mode === 'auto') {
      if (params.type === 'lorenz') internalParamsRef.current.rho = 28 + Math.sin(time * 0.3) * 10;
      if (params.type === 'aizawa') internalParamsRef.current.mu = 0.35 + Math.sin(time * 0.2) * 0.1;
      if (params.type === 'dadras') internalParamsRef.current.mu = 3.0 + Math.sin(time * 0.4) * 0.5;
      if (params.type === 'thomas') internalParamsRef.current.mu = 0.2081 + Math.sin(time * 0.4) * 0.05;
    }

    const currentP = internalParamsRef.current;
    const dt = 0.015 * params.speed;
    
    // 背景淡入淡出实现拖尾效果
    ctx.fillStyle = 'rgba(248, 250, 252, 0.15)'; 
    ctx.fillRect(0, 0, width, height);

    let leadScreenPoints: {x: number, y: number}[] = [];

    particlesRef.current.forEach((p, idx) => {
      let dx = 0, dy = 0, dz = 0;

      if (params.type === 'lorenz') {
        dx = 10 * (p.y - p.x);
        dy = p.x * (currentP.rho - p.z) - p.y;
        dz = p.x * p.y - (8/3) * p.z;
      } else if (params.type === 'aizawa') {
        const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
        dx = (p.z - b) * p.x - d * p.y;
        dy = d * p.x + (p.z - b) * p.y;
        dz = c + a * p.z - (Math.pow(p.z, 3) / 3) - (p.x * p.x + p.y * p.y) * (1 + e * p.z) + f * p.z * Math.pow(p.x, 3);
      } else if (params.type === 'dadras') {
        const a = 3, b = 2.7, c = 1.7, d = 2, e = 9;
        dx = p.y - a * p.x + b * p.y * p.z;
        dy = c * p.y - p.x * p.z + p.z;
        dz = d * p.x * p.y - e * p.z;
      } else if (params.type === 'thomas') {
        const b = currentP.mu;
        dx = Math.sin(p.y) - b * p.x;
        dy = Math.sin(p.z) - b * p.y;
        dz = Math.sin(p.x) - b * p.z;
      }

      p.x += dx * dt;
      p.y += dy * dt;
      p.z += dz * dt;

      // 如果是第一个粒子且开启了追踪，记录轨迹
      if (idx === 0 && params.showTrace) {
        pathRef.current.push({ x: p.x, y: p.y, z: p.z });
        if (pathRef.current.length > 600) pathRef.current.shift();
      }

      const screenPos = getScreenPos(p.x, p.y, p.z, params.type, width, height);
      
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    // 绘制主粒子的连续轨迹
    if (params.showTrace && pathRef.current.length > 2) {
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      const colors = PALETTES[params.palette];
      ctx.strokeStyle = colors[0];
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      pathRef.current.forEach((pt, i) => {
        const pos = getScreenPos(pt.x, pt.y, pt.z, params.type, width, height);
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      
      // 添加发光效果
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors[0];
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [params]);

  // 坐标转换辅助函数
  const getScreenPos = (x: number, y: number, z: number, type: string, width: number, height: number) => {
    let scale = height / 60;
    let offsetX = width / 2;
    let offsetY = height / 2;

    if (type === 'aizawa') {
      scale = height / 4.2;
      offsetY = height * 0.65;
    } else if (type === 'dadras') {
      scale = height / 18;
    } else if (type === 'thomas') {
      scale = height / 10;
    } else if (type === 'lorenz') {
      scale = height / 65;
      offsetY = height * 0.85;
    }

    return {
      x: offsetX + x * scale,
      y: offsetY - (type === 'lorenz' || type === 'aizawa' ? z : y) * scale
    };
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default SimulationCanvas;
