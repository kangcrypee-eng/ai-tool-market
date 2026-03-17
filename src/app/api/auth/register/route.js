import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, name, bio } = await req.json();
    if (!email || !password || !name) return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 400 });

    const user = await prisma.user.create({
      data: { email, password: hashPassword(password), name, bio: bio || null },
    });
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: '회원가입 실패' }, { status: 500 });
  }
}
