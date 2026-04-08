import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';

const VALID_CATEGORIES = ['general', 'automation', 'content', 'data', 'marketing', 'productivity'];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const creatorId = searchParams.get('creatorId');
    const sort = searchParams.get('sort');
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
        _count: { select: { payments: true, comments: true } },
      },
      orderBy: sort === 'popular' ? [{ viewCount: 'desc' }, { createdAt: 'desc' }] : { createdAt: 'desc' },
    });

    const response = NextResponse.json({ tools });
    response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return response;
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
        name: sanitizeInput(b.name, LIMITS.toolName),
        description: sanitizeInput(b.description, LIMITS.toolDesc),
        longDescription: sanitizeInput(b.longDescription, LIMITS.toolLongDesc) || '',
        imageUrl: b.imageUrl || null,
        toolUrl: sanitizeInput(b.toolUrl, LIMITS.toolUrl) || null,
        toolContent: b.toolContent || null,
        category: VALID_CATEGORIES.includes(b.category) ? b.category : 'general',
        creatorId: user.id,
        oneTimePrice: b.oneTimePrice ? parseInt(b.oneTimePrice, 10) : null,
        freeTrialDays: parseInt(b.freeTrialDays, 10) || 30,
        status: 'APPROVED',
      },
    });
    return NextResponse.json({ tool }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}
