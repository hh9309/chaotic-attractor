
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationParams, AIModelType } from "../types";

const getAI = (apiKey?: string) => {
  return new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
};

/**
 * 获取基于当前参数的系统性洞察
 */
export const getChaosInsight = async (params: SimulationParams, model: AIModelType = 'gemini-3-flash-preview', apiKey?: string) => {
  const ai = getAI(apiKey);
  // Map deepseek-r1 to flash since pro is being removed
  const effectiveModel = model === 'deepseek-r1' ? 'gemini-3-flash-preview' : model;
  
  const modelNames = {
    lorenz: '洛伦兹吸引子 (Lorenz Attractor)',
    aizawa: '爱泽吸引子 (Aizawa Attractor)',
    dadras: '达德拉斯吸引子 (Dadras Attractor)',
    thomas: '托马斯吸引子 (Thomas Attractor)'
  };

  const systemInstruction = model === 'deepseek-r1' 
    ? "你现在是深度思考模式下的非线性动力学专家。请在回答前进行深度逻辑分析，展现类似于 DeepSeek R1 的链式推理风格，体现数学结构的深层关联。"
    : "你现在是混沌实验室的首席顾问。";

  const prompt = `
    当前模拟：${modelNames[params.type]}。
    参数：λ=${params.type === 'lorenz' ? params.rho : params.mu}。
    
    请结合非线性动力学，解读该系统的美学与物理意义：
    1. Aizawa: 有机宝石形态。
    2. Dadras: 四翼对称与混沌流向。
    3. Thomas: 空间网格与正弦反馈。
    4. Lorenz: 经典的蝴蝶折叠与不可预测性。
    
    中文回答，字数100以内。
  `;

  try {
    const response = await ai.models.generateContent({
      model: effectiveModel,
      contents: prompt,
      config: { 
        systemInstruction,
        temperature: 0.9,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Chaos Insight Error:", error);
    return "算力在混沌的湍流中暂时迷失了方向，请稍后再试。";
  }
};

/**
 * 获取基于用户自定义指令的 AI 响应
 */
export const getCustomAIResponse = async (query: string, params: SimulationParams, model: AIModelType = 'gemini-3-flash-preview', apiKey?: string) => {
  const ai = getAI(apiKey);
  const effectiveModel = model === 'deepseek-r1' ? 'gemini-3-flash-preview' : model;
  
  const systemInstruction = `你是一位世界顶级的非线性动力学与混沌理论专家。
当前实验室正在运行：${params.type} 吸引子。
用户会向你提问或下达指令。请以专业、优雅且富有启发性的语言进行回答。
如果用户的问题涉及数学原理、哲学思考或视觉表现，请深入浅出地解释。
请用中文回答，保持简洁（150字以内）。`;

  try {
    const response = await ai.models.generateContent({
      model: effectiveModel,
      contents: query,
      config: { 
        systemInstruction,
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Response Error:", error);
    return "算力在混沌的湍流中暂时迷失了方向，请稍后再试。";
  }
};

/**
 * 建议探索参数（保持 JSON 格式返回）
 */
export const suggestExploration = async (userIntent: string, model: AIModelType = 'gemini-3-flash-preview', apiKey?: string) => {
  const ai = getAI(apiKey);
  const effectiveModel = model === 'deepseek-r1' ? 'gemini-3-flash-preview' : model;

  const prompt = `
    用户意图：${userIntent}。
    请推荐一个吸引子（lorenz, aizawa, dadras, thomas）及参数。
    请仅返回 JSON。
  `;

  try {
    const response = await ai.models.generateContent({
      model: effectiveModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'lorenz, aizawa, dadras, or thomas' },
            mu: { type: Type.NUMBER },
            rho: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ["type", "description"],
        },
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};
