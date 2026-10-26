// src/app/api/search/route.ts — Universal Search & Natural Language AI Query Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { UniversalSearchEngine } from '@/server/search/universalSearchEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const results = await UniversalSearchEngine.search(q, { category, limit });

    return NextResponse.json({
      success: true,
      message: 'Universal search query processed successfully.',
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while executing universal search.',
        code: 'UNIVERSAL_SEARCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
