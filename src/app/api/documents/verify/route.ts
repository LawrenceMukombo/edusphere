// src/app/api/documents/verify/route.ts — Public Anti-Counterfeit Document Verification API
import { NextRequest, NextResponse } from 'next/server';
import { OfficialDocumentService } from '@/server/services/officialDocument.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || searchParams.get('ref');

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Verification code or document reference number is required.' },
        { status: 400 }
      );
    }

    const verification = await OfficialDocumentService.verifyAuthenticity(code.trim());
    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error verifying document' },
      { status: 500 }
    );
  }
}
