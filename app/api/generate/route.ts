import { NextRequest, NextResponse } from 'next/server';
import { generateWebsite } from '@/lib/generator';
import type { AnalysisResult } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { analysis: AnalysisResult };
    const { analysis } = body;

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    console.log(`Generating website for: ${analysis.url}`);
    const result = await generateWebsite(analysis);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
