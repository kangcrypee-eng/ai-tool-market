import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const user = requireAuth(req);
    const { name, bio } = await req.json();

    const cleanName = sanitizeInput(name, LIMITS.name);
    if (!cleanName) return NextResponse.json({ error: '이름은 1자 이상 입력해주세요.' }, { status: 400 });

    const cleanBio = bio ? sanitizeInput(bio, LIMITS.bio) : null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: cleanName, bio: cleanBio },
      select: { id: true, email: true, name: true, bio: true, role: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '프로필 수정 실패' }, { status: 500 });
  }
}
