import type { AnalysisResult } from './analyze';
import { generateWebsite as baseGenerateWebsite, type GenerationResult } from '../lib/generator';

export { type GenerationResult };

export async function generateWebsite(analysis: AnalysisResult): Promise<GenerationResult> {
  return baseGenerateWebsite(analysis);
}
