
import React from 'react';
import { SimulationParams, PaletteName, PALETTES, SimulationType } from '../types';

interface Props {
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  isAILoading: boolean;
}

interface Preset {
  label: string;
  params: Partial<SimulationParams>;
}

const PRESETS: Record<SimulationType, Preset[]> = {
  lorenz: [
    { label: '经典蝴蝶', params: { rho: 28, sigma: 10, beta: 8/3, speed: 1.0 } },
    { label: '收敛吸引', params: { rho: 14, sigma: 10, beta: 8/3, speed: 0.8 } },
    { label: '高能湍流', params: { rho: 45.92, sigma: 10, beta: 8/3, speed: 1.2 } }
  ],
  aizawa: [
    { label: '有机宝石', params: { mu: 0.35, speed: 1.0 } },
    { label: '核心塌缩', params: { mu: 0.1, speed: 0.6 } },
    { label: '流体飞溅', params: { mu: 0.7, speed: 1.4 } }
  ],
  dadras: [
    { label: '四翼星团', params: { mu: 3.0, speed: 1.0 } },
    { label: '紧致质点', params: { mu: 1.0, speed: 0.7 } },
    { label: '膨胀星系', params: { mu: 8.0, speed: 1.3 } }
  ],
  thomas: [
    { label: '标准迷宫', params: { mu: 0.2081, speed: 1.0 } },
    { label: '有序网格', params: { mu: 0.15, speed: 0.8 } },
    { label: '高熵晶格', params: { mu: 0.35, speed: 1.2 } }
  ]
};

const ControlPanel: React.FC<Props> = ({ params, onUpdateParams, isAILoading }) => {
  const models: { id: SimulationType; label: string; desc: string }[] = [
    { id: 'lorenz', label: '洛伦兹', desc: '经典双翼/蝴蝶效应' },
    { id: 'aizawa', label: '爱泽', desc: '球形几何/珠宝美学' },
    { id: 'dadras', label: '达德拉斯', desc: '四翼对称/星团混沌' },
    { id: 'thomas', label: '托马斯', desc: '环形迷宫/对称晶格' },
  ];

  const currentPresets = PRESETS[params.type];

  return (
    <div className="glass rounded-[32px] p-5 w-[340px] space-y-6 pointer-events-auto border-white/40 shadow-2xl overflow-y-auto h-full custom-scrollbar">
      {/* 模式选择 */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-slate-100/50 pb-1.5">推演模式控制</h2>
          
          <div className="flex bg-slate-100/80 p-1 rounded-xl relative w-full">
             <button 
               onClick={() => onUpdateParams({ mode: 'manual' })}
               className={`relative z-10 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-1 ${params.mode === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               手动控制
             </button>
             <button 
               onClick={() => onUpdateParams({ mode: 'auto' })}
               className={`relative z-10 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-1 flex items-center justify-center gap-1 ${params.mode === 'auto' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <svg className={`w-2.5 h-2.5 ${params.mode === 'auto' ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
               智能演化
             </button>
             {params.mode === 'auto' && (
               <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
               </span>
             )}
          </div>
          
          <p className="text-[9px] text-slate-400 font-medium px-1 leading-tight">
            {params.mode === 'auto' ? '系统将自动在相空间中寻找混沌奇点并动态演化参数。' : '您可以自由调节核心参数，探索特定的动力学稳态。'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => onUpdateParams({ type: m.id })}
              className={`w-full p-3 rounded-xl text-left transition-all border-2 group ${
                params.type === m.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white/40 border-transparent hover:border-indigo-100 text-slate-600'
              }`}
            >
              <div className="font-black text-xs">{m.label}吸引子</div>
              <div className={`text-[9px] ${params.type === m.id ? 'text-indigo-100' : 'text-slate-400'}`}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 快速预设 */}
      <div className="space-y-3">
        <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
          专家预设推演
        </label>
        <div className="flex flex-wrap gap-2">
          {currentPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onUpdateParams({ ...preset.params, mode: 'manual' })}
              className="px-4 py-2 bg-white/50 hover:bg-white rounded-xl text-[11px] font-bold text-slate-700 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 参数控制 */}
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                混沌核心参数 (λ)
              </label>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                {params.mode === 'auto' ? 'AI 正在动态寻优中...' : '等待手动输入参数'}
              </span>
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md transition-all ${params.mode === 'auto' ? 'bg-indigo-50 text-indigo-600 animate-pulse border border-indigo-100' : 'text-slate-600 bg-slate-50'}`}>
              {params.type === 'lorenz' ? params.rho.toFixed(2) : (params.type === 'thomas' ? params.mu.toFixed(4) : params.mu.toFixed(2))}
            </span>
          </div>
          <input 
            type="range"
            min={params.type === 'thomas' ? "0.05" : (params.type === 'lorenz' ? "1" : "0.1")}
            max={params.type === 'thomas' ? "0.4" : (params.type === 'lorenz' ? "50" : "15")}
            step="0.0001"
            disabled={params.mode === 'auto'}
            value={params.type === 'lorenz' ? params.rho : params.mu}
            onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (params.type === 'lorenz') onUpdateParams({ rho: val });
                else onUpdateParams({ mu: val });
            }}
            className={`w-full accent-indigo-600 ${params.mode === 'auto' ? 'opacity-30 cursor-not-allowed' : ''}`}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
          <label className="text-sm font-black text-slate-400 uppercase tracking-widest">路径追踪可视化</label>
          <button 
            onClick={() => onUpdateParams({ showTrace: !params.showTrace })}
            className={`w-12 h-6 rounded-full transition-all relative ${params.showTrace ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${params.showTrace ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100/50">
          <label className="text-sm font-black text-slate-400 uppercase mb-3 block">色彩能谱</label>
          <div className="flex gap-3">
            {(Object.keys(PALETTES) as PaletteName[]).map((p) => (
              <button
                key={p}
                onClick={() => onUpdateParams({ palette: p })}
                className={`w-10 h-10 rounded-xl border-2 transition-all p-1 ${
                  params.palette === p ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div 
                  className="w-full h-full rounded-lg" 
                  style={{ background: `linear-gradient(135deg, ${PALETTES[p][0]}, ${PALETTES[p][1]})` }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
