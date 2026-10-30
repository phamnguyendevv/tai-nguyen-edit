import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all direct audio requests under /audio/sfx/
  if (pathname.startsWith('/audio/sfx/')) {
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const playerHeader = request.headers.get('x-requested-with') || '';
    const secFetchDest = request.headers.get('sec-fetch-dest') || '';
    const secFetchMode = request.headers.get('sec-fetch-mode') || '';

    const allowedHosts = ['localhost:3000', '127.0.0.1:3000', 'localhost', '127.0.0.1'];
    const hasValidOrigin = allowedHosts.some(
      (host) => referer.includes(host) || origin.includes(host)
    );

    // Detect standalone downloaders / sniffer extensions trying to capture direct file URL
    const isDirectNavigation = secFetchDest === 'document';
    const isSnifferTool =
      !hasValidOrigin &&
      (!referer ||
        userAgent.toLowerCase().includes('curl') ||
        userAgent.toLowerCase().includes('wget') ||
        userAgent.toLowerCase().includes('python') ||
        userAgent.toLowerCase().includes('idm') ||
        userAgent.toLowerCase().includes('downloader') ||
        userAgent.toLowerCase().includes('aria2'));

    // Block direct browser address bar visits or unauthorized external downloaders
    if (isDirectNavigation || isSnifferTool || (!hasValidOrigin && playerHeader !== 'SFX-WebPlayer')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied: Direct media sniffing detected.',
          message:
            'Direct access to raw audio files is protected against automated sniffing. Please listen via the web player or use the official platform download button.',
          status: 403,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    // Attach Anti-Sniffing security response headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Content-Disposition', 'inline; filename="preview"');
    response.headers.set('X-Protected-By', 'SFX-AntiSniffer-Guard');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/audio/sfx/:path*'],
};
