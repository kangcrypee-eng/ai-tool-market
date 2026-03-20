import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';
import { getTrialDaysLeft, isInFreeTrial } from '@/lib/payment';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';

const VALID_CATEGORIES = ['general', 'automation', 'content', 'data', 'marketing', 'productivity'];

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, bio: true } },
        files: { orderBy: { createdAt: 'desc' } },
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
    const hasAccess = !!ownership || !!subscription || freeTrial;
    const isCreator = user && tool.creatorId === user.id;
    const isAdmin = user && user.role === 'ADMIN';

    // Access control: hide toolUrl and files when locked
    const responseTool = { ...tool };
    if (!hasAccess && !isCreator && !isAdmin) {
      responseTool.toolUrl = null;
      responseTool.files = [];
    }

    return NextResponse.json({
      tool: responseTool,
      freeTrial,
      trialDaysLeft,
      isLocked: !hasAccess && !isCreator && !isAdmin,
      userAccess: {
        owned: !!ownership,
        subscribed: !!subscription,
        hasAccess: hasAccess || !!isCreator || !!isAdmin,
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
        name: b.name != null ? sanitizeInput(b.name, LIMITS.toolName) : tool.name,
        description: b.description != null ? sanitizeInput(b.description, LIMITS.toolDesc) : tool.description,
        longDescription: b.longDescription != null ? sanitizeInput(b.longDescription, LIMITS.toolLongDesc) : tool.longDescription,
        imageUrl: b.imageUrl ?? tool.imageUrl,
        toolUrl: b.toolUrl != null ? (sanitizeInput(b.toolUrl, LIMITS.toolUrl) || null) : tool.toolUrl,
        category: b.category && VALID_CATEGORIES.includes(b.category) ? b.category : tool.category,
        isOneTimeEnabled: b.isOneTimeEnabled ?? tool.isOneTimeEnabled,
        oneTimePrice: b.oneTimePrice !== undefined ? parseInt(b.oneTimePrice, 10) : tool.oneTimePrice,
        isSubscriptionEnabled: b.isSubscriptionEnabled ?? tool.isSubscriptionEnabled,
        subscriptionPrice: b.subscriptionPrice !== undefined ? parseInt(b.subscriptionPrice, 10) : tool.subscriptionPrice,
        ...(user.role === 'ADMIN' && b.status ? { status: b.status } : {}),
      },
    });
    return NextResponse.json({ tool: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}
