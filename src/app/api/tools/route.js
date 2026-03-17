import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const creatorId = searchParams.get('creatorId');
    const where = {};
    const user = getAuthFromRequest(req);
    if (!user || user.role !== 'ADMIN') where.status = 'APPROVED';
    if (category && category !== 'all') where.category = category;
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    if (creatorId) where.creatorId = creatorId;

    const tools = await prisma.tool.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { subscriptions: { where: { status: 'ACTIVE' } }, payments: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tools });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = requireAuth(req);
    const b = await req.json();
    if (!b.name || !b.description) return NextResponse.json({ error: '이름과 설명은 필수입니다.' }, { status: 400 });

    const tool = await prisma.tool.create({
      data: {
        name: b.name,
        description: b.description,
        longDescription: b.longDescription || '',
        imageUrl: b.imageUrl || null,
        toolUrl: b.toolUrl || null,
        category: b.category || 'general',
        creatorId: user.id,
        isOneTimeEnabled: false,
        oneTimePrice: null,
        isSubscriptionEnabled: false,
        subscriptionPrice: null,
        freeTrialDays: parseInt(b.freeTrialDays) || 30,
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });
    return NextResponse.json({ tool }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}
