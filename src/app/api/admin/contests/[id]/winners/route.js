import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;
    const { entries } = await req.json();

    if (!Array.isArray(entries)) return NextResponse.json({ error: 'entries 배열이 필요합니다.' }, { status: 400 });

    for (const e of entries) {
      if (!['WINNER_1', 'WINNER_2', 'WINNER_3'].includes(e.status)) continue;
      const entry = await prisma.contestEntry.update({
        where: { id: e.entryId },
        data: { status: e.status },
      });
      // Auto-grant winner badge
      const u = await prisma.user.findUnique({ where: { id: entry.userId }, select: { badges: true } });
      if (u && !u.badges.includes(e.status)) {
        await prisma.user.update({ where: { id: entry.userId }, data: { badges: { push: e.status } } });
      }
    }

    // Set contest to ENDED
    await prisma.contest.update({ where: { id }, data: { status: 'ENDED' } });

    return NextResponse.json({ message: '수상작이 발표되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '처리 실패' }, { status: 500 });
  }
}
