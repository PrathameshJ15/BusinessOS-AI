import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayConfig } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── GET /api/health — Platform Health & Readiness Check ──────────────────────

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (dbErr) {
    console.error('[Health Check] Database probe failed:', dbErr);
    dbStatus = 'unhealthy';
  }

  const razorpayConfig = getRazorpayConfig();
  const isHealthy = dbStatus === 'healthy';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          engine: 'Neon PostgreSQL',
        },
        ai: {
          status: process.env.GROQ_API_KEY ? 'configured' : 'fallback-mode',
          provider: 'Groq LLM',
        },
        billing: {
          mode: razorpayConfig.mode,
          status: razorpayConfig.isRealCredentials ? 'live' : 'sandbox-simulation',
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
