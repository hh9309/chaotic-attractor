
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
    const currentP = internalParamsRef.current;
    const time = Date.now() * 0.001;
    
    if (currentP.mode === 'auto') {
      // 使用多重正弦波模拟更复杂的“智能”寻优路径
      const slow = Math.sin(time * 0.1) * 0.5;
      const fast = Math.sin(time * 0.5) * 0.2;
      const combined = slow + fast;

      if (currentP.type === 'lorenz') internalParamsRef.current.rho = 28 + combined * 15;
      if (currentP.type === 'aizawa') internalParamsRef.current.mu = 0.35 + combined * 0.15;
      if (currentP.type === 'dadras') internalParamsRef.current.mu = 3.0 + combined * 0.8;
      if (currentP.type === 'thomas') internalParamsRef.current.mu = 0.2081 + combined * 0.08;
    }

    const dt = 0.015 * currentP.speed;
    
    // 背景淡入淡出实现拖尾效果
    ctx.fillStyle = 'rgba(248, 250, 252, 0.15)'; 
    ctx.fillRect(0, 0, width, height);

    // 智能模式视觉反馈
    if (currentP.mode === 'auto') {
      // 添加一个小小的 AI 状态文字
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(79, 70, 229, 0.4)';
      ctx.fillText('AI EVOLVING...', 20, height - 20);
    }

    particlesRef.current.forEach((p, idx) => {
      let dx = 0, dy = 0, dz = 0;

      if (currentP.type === 'lorenz') {
        dx = 10 * (p.y - p.x);
        dy = p.x * (currentP.rho - p.z) - p.y;
        dz = p.x * p.y - (8/3) * p.z;
      } else if (currentP.type === 'aizawa') {
        const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
        dx = (p.z - b) * p.x - d * p.y;
        dy = d * p.x + (p.z - b) * p.y;
        dz = c + a * p.z - (Math.pow(p.z, 3) / 3) - (p.x * p.x + p.y * p.y) * (1 + e * p.z) + f * p.z * Math.pow(p.x, 3);
      } else if (currentP.type === 'dadras') {
        const a = 3, b = 2.7, c = 1.7, d = 2, e = 9;
        dx = p.y - a * p.x + b * p.y * p.z;
        dy = c * p.y - p.x * p.z + p.z;
        dz = d * p.x * p.y - e * p.z;
      } else if (currentP.type === 'thomas') {
        const b = currentP.mu;
        dx = Math.sin(p.y) - b * p.x;
        dy = Math.sin(p.z) - b * p.y;
        dz = Math.sin(p.x) - b * p.z;
      }

      p.x += dx * dt;
      p.y += dy * dt;
      p.z += dz * dt;

      // 如果是第一个粒子且开启了追踪，记录轨迹
      if (idx === 0 && currentP.showTrace) {
        pathRef.current.push({ x: p.x, y: p.y, z: p.z });
        if (pathRef.current.length > 600) pathRef.current.shift();
      }

      const screenPos = getScreenPos(p.x, p.y, p.z, currentP.type, width, height);
      
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    // 绘制主粒子的连续轨迹
    if (currentP.showTrace && pathRef.current.length > 2) {
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      const colors = PALETTES[currentP.palette];
      ctx.strokeStyle = colors[0];
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      pathRef.current.forEach((pt, i) => {
        const pos = getScreenPos(pt.x, pt.y, pt.z, currentP.type, width, height);
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      
      // 添加发光效果
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors[0];
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, []); // 移除 params 依赖，使用 internalParamsRef

  // 坐标转换辅助函数 - 优化吸引子在画布中的居中表现
  const getScreenPos = (x: number, y: number, z: number, type: string, width: number, height: number) => {
    let scale = height / 60;
    // 向右移动约 2 厘米 (1cm ≈ 37.8px, 2cm ≈ 75px)
    let offsetX = width / 2 + 75;
    let offsetY = height / 2;

    if (type === 'aizawa') {
      scale = height / 4.5;
      // Aizawa 吸引子中心大约在 z=0.5，将其平移至画布中心
      offsetY = height / 2 + 0.5 * scale;
    } else if (type === 'dadras') {
      scale = height / 22;
      offsetY = height / 2;
    } else if (type === 'thomas') {
      scale = height / 12;
      offsetY = height / 2;
    } else if (type === 'lorenz') {
      scale = height / 75;
      // Lorenz 吸引子中心大约在 z=25，将其平移至画布中心
      offsetY = height / 2 + 25 * scale;
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
    
    const animate = () => {
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default SimulationCanvas;
