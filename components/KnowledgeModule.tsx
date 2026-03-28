
import React from 'react';
import { SimulationType } from '../types';

interface Props {
  type: SimulationType;
}

interface KnowledgeContent {
  title: string;
  formula: string;
  intro: string;
  apps: string[];
  philosophy: string;
}

const KNOWLEDGE_BASE: Record<SimulationType, KnowledgeContent> = {
  aizawa: {
    title: "爱泽吸引子 (Aizawa Attractor)",
    formula: "dz/dt = c+az-z³/3-(x²+y²)(1+ez)+fzx³",
    intro: "一个具有惊人几何美感的动力系统。它的轨迹呈现出类似球体、水母或宝石的有机结构，是参数化混沌艺术的代表作。",
    apps: ["生成艺术设计", "复杂系统建模", "流体动力学拓扑研究"],
    philosophy: "当确定性的法则在多维空间中编织，它不再冷酷，而是进化出类似于生命的柔美曲线。"
  },
  dadras: {
    title: "达德拉斯吸引子 (Dadras Attractor)",
    formula: "dx/dt = y-ax+byz, dy/dt = cy-xz+z, dz/dt = dxy-ez",
    intro: "由 Mohammad Dadras 发现的混沌系统，以其标志性的“四翼”结构著称。它在相空间中表现出高度对称且复杂的缠绕，极具观赏性。",
    apps: ["密码学序列生成", "天体动力学扰动模拟", "多稳态拓扑分析"],
    philosophy: "在看似杂乱的喷涌中，系统围绕着四个虚拟的中心旋转，揭示了混沌中存在的深层几何对称。"
  },
  thomas: {
    title: "托马斯环形吸引子 (Thomas Attractor)",
    formula: "dx/dt = sin(y) - bx",
    intro: "一种具有高度空间对称性的混沌系统。随着耗散系数 b 的降低，系统会从稳态进入复杂的网格状迷宫混沌状态。",
    apps: ["晶格动力学分析", "多稳态控制研究", "拓扑秩序探索"],
    philosophy: "秩序以正弦波的形式往复，却在反馈中迷失。它揭示了在一个充满重复规律的世界里，偏差是如何通过递归放大成无限的。"
  },
  lorenz: {
    title: "洛伦兹吸引子 (Lorenz Attractor)",
    formula: "ẋ=σ(y-x), ẏ=x(ρ-z)-y, ż=xy-βz",
    intro: "蝴蝶效应的数学起源。它展示了在确定性的气象方程中，微小的初值差异如何演化成全然不同的未来景象。",
    apps: ["气象预报不可预测性", "热流对流模拟", "激光物理学不稳定性"],
    philosophy: "蝴蝶在巴西扇动翅膀，可能在德克萨斯引起风暴。在无限的嵌套与缠绕中，隐藏着自然的拓扑铁律。"
  }
};

const KnowledgeModule: React.FC<Props> = ({ type }) => {
  const content = KNOWLEDGE_BASE[type];

  return (
    <div className="w-full bg-white py-8 px-12 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">实验室 · 动力学导读</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{content.title}</h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 group">
              <div className="font-mono text-[12px] font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors leading-relaxed">
                {content.formula}
              </div>
              <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase">Dynamics Core</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">系统机制解读</h4>
            <p className="text-xs leading-relaxed text-slate-600 font-medium text-justify">
              {content.intro}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">科学应用领域</h4>
            <div className="grid grid-cols-1 gap-2">
              {content.apps.map((app, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                  <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                  <span className="text-[11px] text-slate-500 font-bold">{app}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">混沌哲学视角</h4>
            <div className="relative p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
              <span className="absolute -top-3 left-4 bg-white px-2 text-indigo-400 text-xl font-serif">“</span>
              <p className="text-[12px] leading-relaxed text-indigo-900 font-semibold italic">
                {content.philosophy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeModule;
