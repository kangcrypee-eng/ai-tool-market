import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!code) return NextResponse.redirect(`${baseUrl}/login?error=카카오 인증 실패`);

  try {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/kakao/callback`;

    // 1. Get access token
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || '토큰 발급 실패');

    // 2. Get user info
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error('사용자 정보 조회 실패');

    const kakaoId = userData.id.toString();
    const kakaoEmail = userData.kakao_account?.email;
    const kakaoName = userData.kakao_account?.profile?.nickname || `kakao_${kakaoId.slice(-6)}`;

    // 3. Find or create user
    let user = await prisma.user.findFirst({
      where: { OR: [{ provider: 'kakao', providerId: kakaoId }, ...(kakaoEmail ? [{ email: kakaoEmail }] : [])] },
    });

    if (user) {
      // Link kakao if email match but no provider
      if (!user.provider) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { provider: 'kakao', providerId: kakaoId },
        });
      }
    } else {
      // Create new user
      const email = kakaoEmail || `kakao_${kakaoId}@kakao.user`;
      user = await prisma.user.create({
        data: {
          email,
          password: '',  // social login, no password
          name: kakaoName,
          provider: 'kakao',
          providerId: kakaoId,
        },
      });
    }

    // 4. Sign JWT and set cookie
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.redirect(baseUrl || '/');
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Kakao login error:', e);
    const errMsg = e?.message || e?.toString() || '카카오 로그인 실패';
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errMsg.slice(0, 200))}`);
  }
}
