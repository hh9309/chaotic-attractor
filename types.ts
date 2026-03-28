
export type SimulationType = 'lorenz' | 'aizawa' | 'dadras' | 'thomas';
export type SimulationMode = 'auto' | 'manual';
export type AIModelType = 'gemini-3-flash-preview' | 'deepseek-r1';

export interface SimulationParams {
  type: SimulationType;
  mode: SimulationMode;
  mu: number;       // 通用控制变量
  sigma: number;    
  rho: number;      
  beta: number;     
  palette: PaletteName;
  speed: number;
  showTrace: boolean; // 新增：是否显示单个粒子的长期轨迹
  resetSignal: number; // 新增：用于触发仿真重置的信号
}

export type PaletteName = 'neon_lab' | 'deep_river' | 'amber_energy' | 'ghost_white';

export const PALETTES: Record<PaletteName, string[]> = {
  neon_lab: ['#00f2fe', '#4facfe', '#7f00ff', '#e100ff'],
  deep_river: ['#00c6fb', '#005bea', '#00d2ff', '#3a7bd5'],
  amber_energy: ['#f83600', '#f9d423', '#ff9a9e', '#fecfef'],
  ghost_white: ['#f8fafc', '#e2e8f0', '#94a3b8', '#1e293b']
};
