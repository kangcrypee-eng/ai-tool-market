import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin, getAuthFromRequest } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const user = getAuthFromRequest(req);

    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        entries: {
          where: { status: { not: 'REJECTED' } },
          include: {
            user: { select: { id: true, name: true } },
            _count: { select: { votes: true } },
            ...(user ? { votes: { where: { userId: user.id }, select: { id: true } } } : {}),
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { entries: true } },
      },
    });
    if (!contest) return NextResponse.json({ error: '콘테스트를 찾을 수 없습니다.' }, { status: 404 });

    // Sort entries by vote count
    contest.entries.sort((a, b) => (b._count?.votes || 0) - (a._count?.votes || 0));

    return NextResponse.json({ contest });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;
    const b = await req.json();

    const data = {};
    if (b.title !== undefined) data.title = b.title;
    if (b.description !== undefined) data.description = b.description;
    if (b.bannerText !== undefined) data.bannerText = b.bannerText;
    if (b.status) data.status = b.status;
    if (b.startDate) data.startDate = new Date(b.startDate);
    if (b.endDate) data.endDate = new Date(b.endDate);
    if (b.votingEnd !== undefined) data.votingEnd = b.votingEnd ? new Date(b.votingEnd) : null;
    if (b.resultDate !== undefined) data.resultDate = b.resultDate ? new Date(b.resultDate) : null;
    if (b.prizes !== undefined) data.prizes = b.prizes;
    if (b.rules !== undefined) data.rules = b.rules;

    const contest = await prisma.contest.update({ where: { id }, data });
    return NextResponse.json({ contest });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}
