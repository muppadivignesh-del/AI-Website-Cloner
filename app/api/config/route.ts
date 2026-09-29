import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Check if API key is configured
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isConfigured = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10);
  return NextResponse.json({ configured: isConfigured });
}

// Save the API key to .env.local
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { apiKey: string };
    const { apiKey } = body;

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();

    // Verify key with Google AI Studio endpoint
    try {
      const verifyRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`,
        { method: 'GET' }
      );
      if (verifyRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid API key format. Please copy a valid key from https://aistudio.google.com/apikey' },
          { status: 400 }
        );
      }
    } catch {
      // Network check optional
    }

    // Update .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmedKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEY=${trimmedKey}\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');
    process.env.GEMINI_API_KEY = trimmedKey;

    return NextResponse.json({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save API key' },
      { status: 500 }
    );
  }
}
