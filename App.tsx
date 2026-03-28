
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
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const updateParams = useCallback((newParams: Partial<SimulationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const handleExplain = async () => {
    setIsAILoading(true);
    const insight = await getChaosInsight(params, aiModel, apiKey);
    setAiInsight(insight);
    setIsAILoading(false);
  };

  const handleCustomQuery = async (query: string) => {
    setIsAILoading(true);
    const response = await getCustomAIResponse(query, params, aiModel, apiKey);
    setAiInsight(response);
    setIsAILoading(false);
  };

  useEffect(() => {
    if (params.type === 'dadras') updateParams({ mu: 3.0 });
    if (params.type === 'lorenz') updateParams({ rho: 28 });
    
    const timer = setTimeout(() => handleExplain(), 2000);
    return () => clearTimeout(timer);
  }, [params.type]);

  const handleReset = () => {
    setParams({
      type: 'lorenz',
      mode: 'auto',
      mu: 0.5,
      sigma: 10,
      rho: 28,
      beta: 8/3,
      palette: 'neon_lab',
      speed: 1.0,
      showTrace: true,
      resetSignal: Date.now()
    });
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#f8fafc] overflow-y-auto custom-scrollbar">
      
      {/* 1. 核心实验区 - 仿真视口 */}
      <div className="relative w-full flex-shrink-0 h-[65vh] min-h-[550px] overflow-hidden border-b border-slate-200 z-10 bg-slate-50">
        <div className="absolute inset-0 z-0">
          <SimulationCanvas params={params} />
        </div>

        {/* 顶部标题栏 */}
        <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-start pointer-events-none">
          <div className="glass px-8 py-5 rounded-[30px] pointer-events-auto border-l-8 border-l-indigo-600 shadow-2xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              混沌与分岔实验室
              <span className="text-[9px] bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full font-black tracking-widest">CHAOS v3.3</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 font-medium tracking-wide italic">
              “秩序是混乱的一种特殊状态。”
            </p>
          </div>

          <div className="flex gap-4 pointer-events-auto items-center">
            <div className="glass px-5 py-2.5 rounded-2xl text-[10px] font-mono font-black text-indigo-600 flex items-center gap-3 shadow-lg">
               <span className={`w-2 h-2 rounded-full ${params.speed > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
               REALTIME ENGINE
            </div>
            <button onClick={handleReset} className="glass px-5 py-2.5 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-white shadow-xl transition-all border border-white/50 active:scale-95">系统重置</button>
          </div>
        </div>

        {/* 侧边参数面板 */}
        <div className="absolute inset-y-0 left-0 z-20 pointer-events-none flex items-center p-8">
          <ControlPanel 
            params={params} 
            onUpdateParams={updateParams} 
            isAILoading={isAILoading}
          />
        </div>

        {/* 右侧状态指标 */}
        <div className="absolute top-32 right-3 z-20 pointer-events-none flex flex-col items-end gap-4 transition-all duration-700">
          <div className="glass px-6 py-4 rounded-[28px] pointer-events-auto min-w-[200px] shadow-xl border border-white/50">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3">相空间能量图谱</h3>
            <div className="flex gap-1.5 items-end h-8">
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-indigo-500/20 rounded-t-sm transition-all duration-500" 
                  style={{ height: `${15 + Math.random() * 85}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="glass px-6 py-4 rounded-[28px] pointer-events-auto shadow-xl border border-white/50">
            <div className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">李雅普诺夫指数</div>
            <div className="text-xl font-mono font-black text-indigo-600">
              {Math.abs(params.mu * 0.85 + (params.rho/28) * 0.15).toFixed(5)} λ
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
        />
      </section>

    </div>
  );
};

export default App;
