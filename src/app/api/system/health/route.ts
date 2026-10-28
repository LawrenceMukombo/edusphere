// GET /api/system/health - Resilient health check endpoint to verify DB connectivity
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: 'UP',
      database: 'CONNECTED',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
