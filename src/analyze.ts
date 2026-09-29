import { analyzeWebsite as baseAnalyzeWebsite, type AnalysisResult, type SectionInfo, type PageMetadata } from '../lib/analyzer';

export { type AnalysisResult, type SectionInfo, type PageMetadata };

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  // Validate URL format
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('URL must use HTTP or HTTPS protocol');
  }

  return baseAnalyzeWebsite(url);
}
