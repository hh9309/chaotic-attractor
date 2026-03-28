
import React, { useState, useCallback, useEffect } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import AIModule from './components/AIModule';
import KnowledgeModule from './components/KnowledgeModule';
import { SimulationParams, AIModelType } from './types';
import { getChaosInsight, getCustomAIResponse } from './services/geminiService';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    type: 'lorenz',
    mode: 'auto',
    mu: 0.5,
    sigma: 10,
    rho: 28,
    beta: 8/3,
    palette: 'neon_lab',
    speed: 1.0,
    showTrace: true,
    resetSignal: 0
  });

  const [aiModel, setAiModel] = useState<AIModelType>('gemini-3-flash-preview');
  const [apiKey, setApiKey] = useState<string>('');
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const updateParams = useCallback((newParams: Partial<SimulationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const handleExplain = async () => {
    if (!isAIConfigured) return;
    setIsAILoading(true);
    const insight = await getChaosInsight(params, aiModel, apiKey);
    setAiInsight(insight);
    setIsAILoading(false);
  };

  const handleCustomQuery = async (query: string) => {
    if (!isAIConfigured) return;
    setIsAILoading(true);
    const response = await getCustomAIResponse(query, params, aiModel, apiKey);
    setAiInsight(response);
    setIsAILoading(false);
  };

  useEffect(() => {
    if (params.type === 'dadras') updateParams({ mu: 3.0 });
    if (params.type === 'lorenz') updateParams({ rho: 28 });
    
    if (isAIConfigured) {
      const timer = setTimeout(() => handleExplain(), 2000);
      return () => clearTimeout(timer);
    }
  }, [params.type, isAIConfigured]);

  const handleReset = () => {
    // 仅重置仿真参数，保留当前吸引子类型和 AI 状态
    setParams(prev => ({
      ...prev,
      mode: 'auto',
      mu: 0.5,
      sigma: 10,
      rho: 28,
      beta: 8/3,
      palette: 'neon_lab',
      speed: 1.0,
      showTrace: true,
      resetSignal: Date.now()
    }));
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#f8fafc] overflow-y-auto custom-scrollbar">
      
      {/* 1. 核心实验区 - 仿真视口 */}
      <div className="relative w-full flex-shrink-0 h-[45vh] min-h-[400px] overflow-hidden border-b border-slate-200 z-10 bg-slate-50">
        <div className="absolute inset-0 z-0">
          <SimulationCanvas params={params} />
        </div>

        {/* 左侧集成控制区 - 标题与控制面板对齐衔接 */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none flex flex-col gap-4 h-[calc(100%-3rem)]">
          {/* 标题模块 - 宽度强制对齐 ControlPanel (340px) */}
          <div className="glass w-[340px] px-8 py-6 rounded-[32px] pointer-events-auto border-l-[10px] border-l-indigo-600 shadow-2xl flex flex-col justify-center animate-in slide-in-from-left-8 duration-700">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              混沌与分岔实验室
              <span className="text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">v3.3</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide italic">
              “秩序是混乱的一种特殊状态。”
            </p>
          </div>

          {/* 侧边参数面板 */}
          <div className="pointer-events-auto flex-1 overflow-hidden animate-in slide-in-from-left-12 duration-1000">
            <ControlPanel 
              params={params} 
              onUpdateParams={updateParams} 
              isAILoading={isAILoading}
            />
          </div>
        </div>

        {/* 右侧操作与状态区 */}
        <div className="absolute top-6 right-6 z-20 pointer-events-none flex flex-col items-end gap-4">
          <div className="flex gap-3 pointer-events-auto items-center">
            <div className="glass px-5 py-2.5 rounded-2xl text-[10px] font-mono font-black text-indigo-600 flex items-center gap-2.5 shadow-lg border border-white/50">
               <span className={`w-2 h-2 rounded-full ${params.speed > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
               ENGINE ACTIVE
            </div>
            <button 
              onClick={handleReset} 
              className="glass px-6 py-2.5 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-white hover:text-indigo-600 shadow-xl transition-all border border-white/50 active:scale-95"
            >
              重置系统
            </button>
          </div>

          {/* 状态指标 */}
          <div className="flex flex-col items-end gap-3 transition-all duration-700">
            <div className="glass px-5 py-4 rounded-[28px] pointer-events-auto min-w-[180px] shadow-xl border border-white/50">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">相空间能量图谱</h3>
              <div className="flex gap-1.5 items-end h-8">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-indigo-500/20 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${15 + Math.random() * 85}%` }}
                  />
                ))}
              </div>
            </div>
            
            <div className="glass px-5 py-4 rounded-[28px] pointer-events-auto shadow-xl border border-white/50">
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">李雅普诺夫指数</div>
              <div className="text-lg font-mono font-black text-indigo-600">
                {Math.abs(params.mu * 0.85 + (params.rho/28) * 0.15).toFixed(4)} λ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 独立知识百科区 */}
      <section className="w-full bg-white relative z-10 py-4 border-b border-slate-100">
        <KnowledgeModule type={params.type} />
      </section>

      {/* 3. 底部 AI 交互模块 */}
      <section className="w-full bg-slate-50 relative z-10">
        <AIModule 
          insight={aiInsight}
          onCloseInsight={() => setAiInsight(null)}
          onApplyParams={updateParams}
          onTriggerExplain={handleExplain}
          onCustomQuery={handleCustomQuery}
          isAILoading={isAILoading}
          currentModel={aiModel}
          onModelChange={setAiModel}
          onApiKeyChange={setApiKey}
          isConfigured={isAIConfigured}
          onConfigured={() => setIsAIConfigured(true)}
        />
      </section>

    </div>
  );
};

export default App;
