import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { confirmTossPayment, calculateFees } from '@/lib/payment';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount'), 10);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent('결제 정보가 올바르지 않습니다.')}`);
  }

  try {
    const user = getAuthFromRequest(req);
    if (!user) return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent('로그인이 필요합니다.')}`);

    // orderId format: order_{toolId}_{timestamp}
    const parts = orderId.split('_');
    const toolId = parts[1];
    if (!toolId) throw new Error('잘못된 주문번호');

    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) throw new Error('툴을 찾을 수 없습니다.');
    if (!tool.oneTimePrice || tool.oneTimePrice <= 0) throw new Error('유료 구매가 불가능한 툴입니다.');
    if (amount !== tool.oneTimePrice) throw new Error('금액이 일치하지 않습니다.');

    const existing = await prisma.userToolOwnership.findUnique({
      where: { userId_toolId: { userId: user.id, toolId } },
    });
    if (existing) throw new Error('이미 구매한 툴입니다.');

    // Confirm with Toss
    await confirmTossPayment(paymentKey, orderId, amount);
    const { platformFee, creatorAmount } = calculateFees(amount);

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId: user.id, toolId,
          amountTotal: amount, platformFee, creatorAmount,
          tossPaymentKey: paymentKey, tossOrderId: orderId,
        },
      }),
      prisma.userToolOwnership.create({ data: { userId: user.id, toolId } }),
    ]);

    return NextResponse.redirect(`${baseUrl}/payment/success?toolId=${toolId}`);
  } catch (e) {
    return NextResponse.redirect(`${baseUrl}/payment/fail?message=${encodeURIComponent(e.message || '결제 처리 중 오류가 발생했습니다.')}`);
  }
}
