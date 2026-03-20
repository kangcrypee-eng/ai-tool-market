import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message') || '구독 등록이 취소되었습니다.';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent(message)}`);
}
