import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { entryId } = params;

    const entry = await prisma.contestEntry.findUnique({
      where: { id: entryId },
      include: { contest: { select: { status: true } } },
    });
    if (!entry) return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
    if (!['ACTIVE', 'VOTING'].includes(entry.contest.status)) {
      return NextResponse.json({ error: '투표 기간이 아닙니다.' }, { status: 400 });
    }

    await prisma.contestVote.create({
      data: { userId: user.id, entryId },
    });

    const likes = await prisma.contestVote.count({ where: { entryId } });
    return NextResponse.json({ likes });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '실패' }, { status: 500 });
  }
}
