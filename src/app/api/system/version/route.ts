// src/app/api/system/version/route.ts
import { NextResponse } from 'next/server';
import { SYSTEM_VERSION } from '@/config/version';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SYSTEM_VERSION,
  });
}
