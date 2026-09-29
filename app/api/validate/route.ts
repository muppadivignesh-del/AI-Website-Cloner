import { NextRequest, NextResponse } from 'next/server';
import { fixCodeErrors } from '@/lib/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { code: string; errors: string };
    const { code, errors } = body;

    if (!code || !errors) {
      return NextResponse.json({ error: 'Code and errors are required' }, { status: 400 });
    }

    console.log('Fixing code errors...');
    const fixedCode = await fixCodeErrors(code, errors);

    return NextResponse.json({ success: true, code: fixedCode });
  } catch (error) {
    console.error('Fix error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fix failed' },
      { status: 500 }
    );
  }
}
