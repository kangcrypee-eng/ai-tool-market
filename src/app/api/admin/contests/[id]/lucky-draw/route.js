import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) return NextResponse.json({ error: '콘테스트를 찾을 수 없습니다.' }, { status: 404 });
    if (!contest.luckyDrawEnabled) return NextResponse.json({ error: '럭키드로우가 비활성화되어 있습니다.' }, { status: 400 });

    // Get unique voters
    const voters = await prisma.contestVote.findMany({
      where: { entry: { contestId: id } },
      select: { userId: true },
      distinct: ['userId'],
    });

    if (voters.length === 0) return NextResponse.json({ error: '투표한 유저가 없습니다.' }, { status: 400 });

    // Random shuffle and pick winners
    const shuffled = voters.sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, contest.luckyDrawCount).map(v => v.userId);

    await prisma.contest.update({
      where: { id },
      data: { luckyDrawWinners: winners },
    });

    // Get winner names for response
    const winnerUsers = await prisma.user.findMany({
      where: { id: { in: winners } },
      select: { id: true, name: true },
    });

    return NextResponse.json({ winners: winnerUsers, count: winners.length });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '추첨 실패' }, { status: 500 });
  }
}
