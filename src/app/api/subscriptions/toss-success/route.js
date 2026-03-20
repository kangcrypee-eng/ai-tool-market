import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { issueBillingKey, calculateFees } from '@/lib/payment';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const authKey = searchParams.get('authKey');
  const customerKey = searchParams.get('customerKey');
  const toolId = searchParams.get('toolId');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!authKey || !customerKey || !toolId) {
    return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent('구독 정보가 올바르지 않습니다.')}`);
  }

  try {
    const user = getAuthFromRequest(req);
    if (!user) return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent('로그인이 필요합니다.')}`);

    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool || !tool.isSubscriptionEnabled) throw new Error('구독이 불가능한 툴입니다.');

    const exists = await prisma.subscription.findFirst({
      where: { userId: user.id, toolId, status: 'ACTIVE' },
    });
    if (exists) throw new Error('이미 구독 중입니다.');

    const billing = await issueBillingKey(authKey, customerKey);
    const next = new Date();
    next.setDate(next.getDate() + 30);
    const { platformFee, pgFee, creatorAmount } = calculateFees(tool.subscriptionPrice);

    await prisma.$transaction([
      prisma.subscription.create({
        data: {
          userId: user.id, toolId,
          billingKey: billing.billingKey,
          price: tool.subscriptionPrice,
          status: 'ACTIVE',
          nextBillingAt: next,
          lastBilledAt: new Date(),
        },
      }),
      prisma.payment.create({
        data: {
          userId: user.id, toolId, paymentType: 'SUBSCRIPTION',
          amountTotal: tool.subscriptionPrice,
          platformFee, pgFee, creatorAmount,
        },
      }),
    ]);

    return NextResponse.redirect(`${baseUrl}/payment/success?toolId=${toolId}&type=subscription`);
  } catch (e) {
    return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent(e.message || '구독 처리 중 오류가 발생했습니다.')}`);
  }
}
