import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { issueBillingKey, calculateFees } from '@/lib/payment';

export async function GET(req) {
  try {
    const user = requireAuth(req);
    const subs = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { tool: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ subscriptions: subs });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = requireAuth(req);
    const { authKey, toolId } = await req.json();
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool || !tool.isSubscriptionEnabled) return NextResponse.json({ error: '구독 불가' }, { status: 400 });

    const exists = await prisma.subscription.findFirst({ where: { userId: user.id, toolId, status: 'ACTIVE' } });
    if (exists) return NextResponse.json({ error: '이미 구독 중' }, { status: 400 });

    const billing = await issueBillingKey(authKey, user.id);
    const next = new Date(); next.setDate(next.getDate() + 30);
    const { platformFee, pgFee, creatorAmount } = calculateFees(tool.subscriptionPrice);

    const [sub, payment] = await prisma.$transaction([
      prisma.subscription.create({
        data: { userId: user.id, toolId, billingKey: billing.billingKey, price: tool.subscriptionPrice, status: 'ACTIVE', nextBillingAt: next, lastBilledAt: new Date() },
      }),
      prisma.payment.create({
        data: { userId: user.id, toolId, paymentType: 'SUBSCRIPTION', amountTotal: tool.subscriptionPrice, platformFee, pgFee, creatorAmount },
      }),
    ]);
    return NextResponse.json({ subscription: sub, payment }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: e.message || '구독 실패' }, { status: 500 });
  }
}
