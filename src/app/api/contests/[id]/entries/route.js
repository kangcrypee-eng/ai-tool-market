import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const entries = await prisma.contestEntry.findMany({
      where: { contestId: id, status: { not: 'REJECTED' } },
      include: {
        user: { select: { id: true, name: true, badges: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    entries.sort((a, b) => (b._count?.votes || 0) - (a._count?.votes || 0));
    return NextResponse.json({ entries });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) return NextResponse.json({ error: '콘테스트를 찾을 수 없습니다.' }, { status: 404 });
    if (contest.status !== 'ACTIVE') return NextResponse.json({ error: '접수 기간이 아닙니다.' }, { status: 400 });

    const existing = await prisma.contestEntry.findFirst({ where: { contestId: id, userId: user.id } });
    if (existing) return NextResponse.json({ error: '이미 출품하셨습니다. 1인 1출품만 가능합니다.' }, { status: 400 });

    const { title, description, videoUrl, tryUrl, images } = await req.json();
    if (!title || !description) return NextResponse.json({ error: '제목과 설명은 필수입니다.' }, { status: 400 });

    const entry = await prisma.contestEntry.create({
      data: {
        contestId: id,
        userId: user.id,
        title,
        description,
        videoUrl: videoUrl || null,
        tryUrl: tryUrl || null,
        images: Array.isArray(images) ? images.filter(u => typeof u === 'string').slice(0, 5) : [],
      },
      include: { user: { select: { id: true, name: true, badges: true } } },
    });
    // Auto-grant EARLY_BUILDER badge
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { badges: true } });
    if (dbUser && !dbUser.badges.includes('EARLY_BUILDER')) {
      await prisma.user.update({ where: { id: user.id }, data: { badges: { push: 'EARLY_BUILDER' } } });
    }
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '출품 실패' }, { status: 500 });
  }
}
