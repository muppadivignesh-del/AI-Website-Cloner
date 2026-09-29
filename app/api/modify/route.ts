import { NextRequest, NextResponse } from 'next/server';
import { modifyWebsite } from '@/lib/generator';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      currentCode?: string;
      instruction: string;
      url?: string;
    };
    let { currentCode, instruction, url } = body;

    // If currentCode wasn't passed, read from app/cloned/page.tsx
    if (!currentCode || !currentCode.trim()) {
      const clonedPath = path.join(process.cwd(), 'app', 'cloned', 'page.tsx');
      if (fs.existsSync(clonedPath)) {
        currentCode = fs.readFileSync(clonedPath, 'utf-8');
      }
    }

    if (!currentCode || !instruction) {
      return NextResponse.json(
        { error: 'Current code and instruction are required. Please clone a website first.' },
        { status: 400 }
      );
    }

    console.log(`Modifying website: "${instruction}"`);
    const result = await modifyWebsite(currentCode, instruction, url || '');

    if (!result.changed) {
      return NextResponse.json(
        {
          success: false,
          error: result.warning || `No changes could be applied for: "${instruction}".`,
          code: currentCode,
        },
        { status: 422 }
      );
    }

    // Auto-save to app/cloned/page.tsx
    try {
      const clonedDir = path.join(process.cwd(), 'app', 'cloned');
      if (!fs.existsSync(clonedDir)) {
        fs.mkdirSync(clonedDir, { recursive: true });
      }
      const clonedPath = path.join(clonedDir, 'page.tsx');
      fs.writeFileSync(clonedPath, result.code, 'utf-8');
    } catch (saveErr) {
      console.warn('Auto-save to disk failed:', saveErr);
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      source: result.source,
      warning: result.warning,
    });
  } catch (error) {
    console.error('Modification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Modification failed' },
      { status: 500 }
    );
  }
}
