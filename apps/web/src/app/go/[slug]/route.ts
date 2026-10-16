import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateDestination } from '@/lib/smart-links';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function renderErrorPage(title: string, message: string, status: number = 404): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Saarthi AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
      padding: 1.5rem;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.75rem;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    a.btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      background: #2563eb;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: background 0.15s ease;
    }
    a.btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${status === 404 ? '404 NOT FOUND' : 'LINK UNAVAILABLE'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Return to Home</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ─── GET /go/[slug] — Public Smart Link Redirect Engine ───────────────────────

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const slug = resolvedParams?.slug;

    if (!slug) {
      return renderErrorPage('Invalid Link', 'No smart link identifier was provided.', 400);
    }

    const cleanSlug = slug.toLowerCase().trim();

    // 1. Look up link in Neon database
    const link = await prisma.smartLink.findUnique({
      where: { slug: cleanSlug },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!link) {
      return renderErrorPage(
        'Smart Link Not Found',
        `The link "/go/${cleanSlug}" does not exist or may have been deleted.`,
        404
      );
    }

    // 2. Check if link is paused / disabled
    if (!link.isActive) {
      return renderErrorPage(
        'Link Currently Inactive',
        `This smart link has been temporarily paused by ${link.organization.name || 'the business'}. Please check back later.`,
        410
      );
    }

    // 3. Check expiration
    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      return renderErrorPage(
        'Link Expired',
        `This smart link expired on ${new Date(link.expiresAt).toLocaleDateString()}. Please contact ${link.organization.name || 'the business'} for an updated link.`,
        410
      );
    }

    // 4. Validate destination security
    const destValidation = validateDestination(link.destinationType as any, link.destinationValue);
    if (!destValidation.isValid) {
      return renderErrorPage(
        'Unsafe Destination',
        'The destination address configured for this link is invalid or blocked for security reasons.',
        400
      );
    }

    // 5. Track Click & Increment Counter
    const referer = request.headers.get('referer')?.slice(0, 200) || null;

    // Asynchronously record event & increment total clicks
    await Promise.allSettled([
      prisma.smartLinkEvent.create({
        data: {
          organizationId: link.organizationId,
          smartLinkId: link.id,
          campaignId: link.campaignId,
          eventType: 'SMART_LINK_VISIT',
          referrerHost: referer,
        },
      }),
      prisma.smartLink.update({
        where: { id: link.id },
        data: { totalClicks: { increment: 1 } },
      }),
    ]);

    // 6. Resolve Destination URL
    let destination = destValidation.destinationUrl;
    if (destination.startsWith('/')) {
      destination = `${request.nextUrl.origin}${destination}`;
    }

    // 7. Temporary Redirect (307)
    return NextResponse.redirect(destination, {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[GET /go/[slug]] Error:', error);
    return renderErrorPage(
      'Service Error',
      'An unexpected error occurred while resolving the smart link. Please try again shortly.',
      500
    );
  }
}
