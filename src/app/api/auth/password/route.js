import { prisma } from '@/lib/prisma';
import { requireAuth, comparePassword, hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/sanitize';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const user = requireAuth(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json({ error: '새 비밀번호는 6자 이상 100자 이하여야 합니다.' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });

    if (!comparePassword(currentPassword, dbUser.password)) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword) },
    });

    return NextResponse.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '비밀번호 변경 실패' }, { status: 500 });
  }
}
