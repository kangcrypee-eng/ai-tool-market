import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { confirmTossPayment, calculateFees } from '@/lib/payment';

export async function POST(req) {
  try {
    const user = requireAuth(req);
    const { paymentKey, orderId, amount, toolId } = await req.json();

    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool || !tool.oneTimePrice || tool.oneTimePrice <= 0) return NextResponse.json({ error: '구매 불가' }, { status: 400 });
    if (amount !== tool.oneTimePrice) return NextResponse.json({ error: '금액 불일치' }, { status: 400 });

    const existing = await prisma.userToolOwnership.findUnique({ where: { userId_toolId: { userId: user.id, toolId } } });
    if (existing) return NextResponse.json({ error: '이미 구매함' }, { status: 400 });

    await confirmTossPayment(paymentKey, orderId, amount);
    const { platformFee, creatorAmount } = calculateFees(amount);

    const [payment, ownership] = await prisma.$transaction([
      prisma.payment.create({
        data: { userId: user.id, toolId, amountTotal: amount, platformFee, creatorAmount, tossPaymentKey: paymentKey, tossOrderId: orderId },
      }),
      prisma.userToolOwnership.create({ data: { userId: user.id, toolId } }),
    ]);
    return NextResponse.json({ payment, ownership });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: e.message || '결제 실패' }, { status: 500 });
  }
}
