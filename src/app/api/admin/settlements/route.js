import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    requireAdmin(req);
    const settlements = await prisma.settlement.findMany({
      include: { creator: { select: { id: true, name: true, email: true } } },
      orderBy: { requestedAt: 'desc' },
    });
    return NextResponse.json({ settlements });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
