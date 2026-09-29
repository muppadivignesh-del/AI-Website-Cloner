import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { code: string; filename?: string };
    const { code, filename = 'page.tsx' } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Write the cloned page code to a special directory
    const clonedDir = path.join(process.cwd(), 'app', 'cloned');
    if (!fs.existsSync(clonedDir)) {
      fs.mkdirSync(clonedDir, { recursive: true });
    }

    const filePath = path.join(clonedDir, filename);
    fs.writeFileSync(filePath, code, 'utf-8');

    return NextResponse.json({ success: true, path: `/cloned` });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const clonedPagePath = path.join(process.cwd(), 'app', 'cloned', 'page.tsx');

    if (!fs.existsSync(clonedPagePath)) {
      return NextResponse.json({ error: 'No cloned page found' }, { status: 404 });
    }

    const code = fs.readFileSync(clonedPagePath, 'utf-8');
    return NextResponse.json({ success: true, code });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Read failed' },
      { status: 500 }
    );
  }
}
