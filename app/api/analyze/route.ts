import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { url: string };
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'URL must use HTTP or HTTPS' }, { status: 400 });
    }

    console.log(`Analyzing website: ${url}`);
    const analysis = await analyzeWebsite(url);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    let message = 'Analysis failed';
    if (error instanceof Error) {
      if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        message = 'Unable to reach website. The domain does not exist or could not be resolved (ERR_NAME_NOT_RESOLVED). Please verify the URL.';
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        message = 'Connection refused. The server at this address is not responding or blocking requests.';
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        message = 'Request timed out. The website took too long to respond.';
      } else {
        message = error.message;
      }
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
