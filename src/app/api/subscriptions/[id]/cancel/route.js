import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== user.id) return NextResponse.json({ error: '없음' }, { status: 404 });
    const updated = await prisma.subscription.update({ where: { id }, data: { status: 'CANCELED' } });
    return NextResponse.json({ subscription: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '해지 실패' }, { status: 500 });
  }
}
