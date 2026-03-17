import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const authorId = searchParams.get('authorId');
    const where = {};
    if (type && type !== 'all') where.type = type.toUpperCase();
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { body: { contains: search, mode: 'insensitive' } }];
    if (authorId) where.authorId = authorId;

    const user = getAuthFromRequest(req);

    const include = {
      author: { select: { id: true, name: true } },
      tool: { select: { id: true, name: true, category: true, subscriptionPrice: true, oneTimePrice: true, isOneTimeEnabled: true, isSubscriptionEnabled: true, freeTrialDays: true, publishedAt: true } },
      _count: { select: { comments: true, likes: true } },
    };
    if (user) {
      include.likes = { where: { userId: user.id }, select: { id: true } };
    }

    const posts = await prisma.post.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = requireAuth(req);
    const { type, title, body, tags, toolId } = await req.json();
    if (!title || !body) return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        type: type || 'TIP',
        title,
        body,
        tags: tags || [],
        toolId: toolId || null,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error('Post creation error:', e);
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: e.message || '작성 실패' }, { status: 500 });
  }
}
