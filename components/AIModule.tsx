
import React, { useState } from 'react';
import { SimulationParams, AIModelType } from '../types';

interface Props {
  insight: string | null;
  onCloseInsight: () => void;
  onApplyParams: (newParams: Partial<SimulationParams>) => void;
  onTriggerExplain: () => void;
  onCustomQuery: (query: string) => void;
  isAILoading: boolean;
  currentModel: AIModelType;
  onModelChange: (model: AIModelType) => void;
  onApiKeyChange: (key: string) => void;
  isConfigured: boolean;
  onConfigured: () => void;
}

const AIModule: React.FC<Props> = ({ 
  insight, 
  onCloseInsight, 
  onApplyParams, 
  onTriggerExplain, 
  onCustomQuery,
  isAILoading,
  currentModel,
  onModelChange,
  onApiKeyChange,
  isConfigured,
  onConfigured
}) => {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // 本地配置状态，仅在点击“确认”后同步到父组件
  const [localModel, setLocalModel] = useState<AIModelType>(currentModel);
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAILoading || !isConfigured) return;
    onCustomQuery(input);
    setInput(''); // 提交后清空输入框
  };

  const handleConfirmSettings = () => {
    onModelChange(localModel);
    onApiKeyChange(localApiKey);
    onConfigured();
    setShowSettings(false);
  };

  const modelOptions: { id: AIModelType; label: string; sub: string }[] = [
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', sub: '极致速度 · 实时响应' },
    { id: 'deepseek-r1', label: 'DeepSeek R1', sub: '深度思考 · 逻辑推演' },
  ];

  return (
    <div className="w-full flex flex-col">
      <div className="w-full bg-slate-50 border-t border-slate-200">
        
        {/* 1. 状态指示与模型切换器 */}
        <div className="px-12 py-5 border-b border-slate-200/60 flex justify-between items-center bg-white/40">
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 ${isAILoading ? 'block' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isAILoading ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">智慧决策中枢</span>
              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                {isConfigured ? `Active Model: ${currentModel}` : '等待配置 AI 引擎...'}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all ${
                showSettings 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-lg'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span className="text-[11px] font-black uppercase tracking-wider">大模型设置</span>
            </button>
            
            {showSettings && (
              <div className="absolute right-0 bottom-full mb-4 bg-white p-6 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 min-w-[360px] z-[100] animate-in fade-in slide-in-from-bottom-6 duration-300">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">选择大模型</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {modelOptions.map((opt) => (
                        <button 
                          key={opt.id}
                          onClick={() => setLocalModel(opt.id)}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all border-2 ${
                            localModel === opt.id 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                              : 'bg-slate-50 border-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-black">{opt.label}</span>
                            {localModel === opt.id && <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">Selected</span>}
                          </div>
                          <div className={`text-[10px] opacity-70 font-medium ${localModel === opt.id ? 'text-indigo-100' : 'text-slate-400'}`}>{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">手工输入 API-Key</h4>
                    <div className="space-y-4 px-1">
                      <div className="relative group">
                        <input 
                          type="password" 
                          value={localApiKey}
                          onChange={(e) => setLocalApiKey(e.target.value)}
                          className="w-full py-3 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-mono focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-all"
                          placeholder="在此输入您的 API Key..."
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                          <div className={`w-1.5 h-1.5 rounded-full ${localApiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></div>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed italic">
                        填入密钥后点击下方确认按钮生效。密钥将仅用于当前会话的 AI 请求。
                      </p>
                      <button 
                        onClick={handleConfirmSettings}
                        className="w-full py-4 px-5 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                      >
                        确认大模型选择
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. 实时报告区 (仅在有洞察结果时显示) */}
        {insight && (
          <div className="px-12 py-10 bg-indigo-50/20 border-b border-indigo-100/30 relative animate-in fade-in slide-in-from-top-4 duration-700">
            <button 
              onClick={onCloseInsight}
              className="absolute top-8 right-12 text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/50 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex gap-12 items-start max-w-7xl mx-auto">
              <div className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-4xl border border-indigo-50/50 shrink-0 select-none">✨</div>
              <div className="space-y-4">
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">AI 实时推演报告</h4>
                <p className="text-[18px] leading-[1.7] text-slate-800 font-medium italic font-serif">“{insight}”</p>
                <div className="flex gap-3">
                  <span className="h-1 w-12 bg-indigo-200 rounded-full"></span>
                  <span className="h-1 w-4 bg-indigo-100 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 核心交互输入区 */}
        <div className="p-12 bg-white">
          <div className="max-w-7xl mx-auto flex gap-10 items-center w-full">
            <form 
              onSubmit={handleSearch}
              className={`flex-1 bg-slate-50/80 hover:bg-white rounded-[35px] flex items-center gap-3 pr-3 border border-slate-200/60 shadow-inner ring-1 ring-transparent focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all duration-300 ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="pl-8 text-indigo-500 py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={isConfigured ? "在此输入您的问题或指令，例如：'解释这个吸引子的混沌形成原因'..." : "请先在大模型设置中确认配置..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!isConfigured}
                className="flex-1 bg-transparent border-none focus:ring-0 text-base py-5 px-2 text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isAILoading || !input.trim() || !isConfigured}
                className={`px-12 py-4 rounded-[28px] text-[13px] font-black transition-all ${
                  isAILoading || !input.trim() || !isConfigured
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 active:scale-95'
                }`}
              >
                {isAILoading ? '思考中...' : '提交并解释'}
              </button>
            </form>

            <button
              onClick={onTriggerExplain}
              disabled={isAILoading || !isConfigured}
              className={`h-20 w-20 rounded-[35px] flex items-center justify-center bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all shrink-0 ${
                isAILoading || !isConfigured ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-90 hover:bg-indigo-50 hover:border-indigo-100 text-slate-700 hover:text-indigo-600'
              }`}
              title={isConfigured ? "即时生成当前动力学洞察" : "请先配置 AI"}
            >
              <div className={`text-4xl transition-all duration-1000 ${isAILoading ? 'animate-spin' : ''}`}>
                {isAILoading ? '⚛' : '🧠'}
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIModule;
