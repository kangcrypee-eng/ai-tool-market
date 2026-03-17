import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';
import { getTrialDaysLeft, isInFreeTrial } from '@/lib/payment';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, bio: true } },
        comments: { where: { postId: null }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { subscriptions: { where: { status: 'ACTIVE' } }, payments: true } },
      },
    });
    if (!tool) return NextResponse.json({ error: '툴을 찾을 수 없습니다.' }, { status: 404 });

    let ownership = null, subscription = null;
    const user = getAuthFromRequest(req);
    if (user) {
      ownership = await prisma.userToolOwnership.findUnique({ where: { userId_toolId: { userId: user.id, toolId: id } } });
      subscription = await prisma.subscription.findFirst({ where: { userId: user.id, toolId: id, status: 'ACTIVE' } });
    }

    const freeTrial = isInFreeTrial(tool);
    const trialDaysLeft = getTrialDaysLeft(tool);

    return NextResponse.json({
      tool,
      freeTrial,
      trialDaysLeft,
      userAccess: {
        owned: !!ownership,
        subscribed: !!subscription,
        hasAccess: !!ownership || !!subscription || freeTrial,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const tool = await prisma.tool.findUnique({ where: { id } });
    if (!tool) return NextResponse.json({ error: '없음' }, { status: 404 });
    if (tool.creatorId !== user.id && user.role !== 'ADMIN') return NextResponse.json({ error: '권한 없음' }, { status: 403 });

    const b = await req.json();
    const updated = await prisma.tool.update({
      where: { id },
      data: {
        name: b.name ?? tool.name,
        description: b.description ?? tool.description,
        longDescription: b.longDescription ?? tool.longDescription,
        imageUrl: b.imageUrl ?? tool.imageUrl,
        category: b.category ?? tool.category,
        isOneTimeEnabled: b.isOneTimeEnabled ?? tool.isOneTimeEnabled,
        oneTimePrice: b.oneTimePrice !== undefined ? parseInt(b.oneTimePrice) : tool.oneTimePrice,
        isSubscriptionEnabled: b.isSubscriptionEnabled ?? tool.isSubscriptionEnabled,
        subscriptionPrice: b.subscriptionPrice !== undefined ? parseInt(b.subscriptionPrice) : tool.subscriptionPrice,
        ...(user.role === 'ADMIN' && b.status ? { status: b.status } : {}),
      },
    });
    return NextResponse.json({ tool: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}
