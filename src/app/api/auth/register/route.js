import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePassword, LIMITS } from '@/lib/sanitize';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, name, bio } = body;
    if (!email || !password || !name) return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();
    if (!validateEmail(cleanEmail)) return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
    if (!validatePassword(password)) return NextResponse.json({ error: '비밀번호는 6자 이상 100자 이하여야 합니다.' }, { status: 400 });

    const cleanName = sanitizeInput(name, LIMITS.name);
    if (!cleanName) return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
    const cleanBio = bio ? sanitizeInput(bio, LIMITS.bio) : null;

    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 400 });

    const referralCode = Math.random().toString(36).substring(2, 10);
    const user = await prisma.user.create({
      data: { email: cleanEmail, password: hashPassword(password), name: cleanName, bio: cleanBio, referralCode },
    });
    // Process referral
    if (body?.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: body.referralCode } });
      if (referrer && referrer.id !== user.id) {
        await prisma.user.update({ where: { id: user.id }, data: { referredBy: referrer.id } });
        const rUser = await prisma.user.findUnique({ where: { id: referrer.id }, select: { badges: true } });
        if (rUser && !rUser.badges.includes('BROKER')) {
          await prisma.user.update({ where: { id: referrer.id }, data: { badges: { push: 'BROKER' } } });
        }
      }
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: '회원가입 실패' }, { status: 500 });
  }
}
