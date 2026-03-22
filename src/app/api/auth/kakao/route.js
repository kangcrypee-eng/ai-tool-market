import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: '카카오 로그인이 설정되지 않았습니다.' }, { status: 500 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/kakao/callback`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
