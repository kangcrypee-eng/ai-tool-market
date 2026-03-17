import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !comparePassword(password, user.password))
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: '로그인 실패' }, { status: 500 });
  }
}
