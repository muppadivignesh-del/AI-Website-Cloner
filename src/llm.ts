import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface LLMOptions {
  temperature?: number;
  maxOutputTokens?: number;
  imagePart?: {
    inlineData: {
      data: string; // base64
      mimeType: 'image/jpeg' | 'image/png';
    };
  };
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-pro-latest',
  'gemini-2.5-flash',
].filter(Boolean) as string[];

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function callLLM(prompt: string, options?: LLMOptions): Promise<string> {
  const genAI = getGeminiClient();
  let lastError: unknown = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          maxOutputTokens: options?.maxOutputTokens ?? 8192,
          temperature: options?.temperature ?? 0.3,
        },
      });

      const parts = options?.imagePart ? [prompt, options.imagePart] : [prompt];
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[LLM] Model ${modelName} call failed:`, msg.slice(0, 100));

      // If project denied access or 403, break candidate iteration
      if (msg.includes('403') || msg.includes('denied') || msg.includes('PERMISSION_DENIED')) {
        break;
      }
    }
  }

  throw lastError || new Error('All LLM candidate models failed');
}
