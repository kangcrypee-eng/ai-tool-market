import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthFromRequest, requireAuth } from '@/lib/auth';
import { getTrialDaysLeft, isInFreeTrial } from '@/lib/payment';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';

const VALID_CATEGORIES = ['general', 'automation', 'content', 'data', 'marketing', 'productivity'];
const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    prisma.tool.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, bio: true } },
        files: { orderBy: { createdAt: 'desc' } },
        comments: { where: { postId: null }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { payments: true } },
      },
    });
    if (!tool) return NextResponse.json({ error: '툴을 찾을 수 없습니다.' }, { status: 404 });

    let ownership = null;
    const user = getAuthFromRequest(req);
    if (user) {
      ownership = await prisma.userToolOwnership.findUnique({ where: { userId_toolId: { userId: user.id, toolId: id } } });
    }

    const freeTrial = isInFreeTrial(tool);
    const trialDaysLeft = getTrialDaysLeft(tool);
    const isCreator = user && tool.creatorId === user.id;
    const isAdmin = user && user.role === 'ADMIN';
    const isPaid = tool.oneTimePrice && tool.oneTimePrice > 0;

    // Feature flag: if payment disabled, always grant access
    let hasAccess;
    if (!paymentEnabled) {
      hasAccess = true;
    } else {
      hasAccess = !!ownership || freeTrial || !isPaid;
    }

    const isLocked = paymentEnabled && isPaid && !hasAccess && !isCreator && !isAdmin;

    // Access control: hide protected content when locked
    const responseTool = { ...tool };
    if (isLocked) {
      responseTool.toolUrl = null;
      responseTool.toolContent = null;
      responseTool.files = [];
    }

    return NextResponse.json({
      tool: responseTool,
      freeTrial,
      trialDaysLeft,
      isLocked,
      userAccess: {
        owned: !!ownership,
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
        toolContent: b.toolContent !== undefined ? (b.toolContent || null) : tool.toolContent,
        category: b.category && VALID_CATEGORIES.includes(b.category) ? b.category : tool.category,
        oneTimePrice: b.oneTimePrice !== undefined ? (b.oneTimePrice ? parseInt(b.oneTimePrice, 10) : null) : tool.oneTimePrice,
        ...(user.role === 'ADMIN' && b.status ? { status: b.status } : {}),
      },
    });
    return NextResponse.json({ tool: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}
