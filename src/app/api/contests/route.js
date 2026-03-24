import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      include: { _count: { select: { entries: true } } },
      orderBy: { startDate: 'desc' },
    });
    // Sort: ACTIVE/VOTING first, then UPCOMING, then ENDED
    const order = { ACTIVE: 0, VOTING: 1, UPCOMING: 2, ENDED: 3 };
    contests.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    return NextResponse.json({ contests });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    requireAdmin(req);
    const b = await req.json();
    if (!b.title || !b.description || !b.startDate || !b.endDate) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }
    const contest = await prisma.contest.create({
      data: {
        title: b.title,
        description: b.description,
        bannerText: b.bannerText || null,
        status: b.status || 'UPCOMING',
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
        votingEnd: b.votingEnd ? new Date(b.votingEnd) : null,
        resultDate: b.resultDate ? new Date(b.resultDate) : null,
        prizes: b.prizes || null,
        rules: b.rules || null,
      },
    });
    return NextResponse.json({ contest }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '생성 실패' }, { status: 500 });
  }
}
