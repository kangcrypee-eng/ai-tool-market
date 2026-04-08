import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 });
    if (!payment.tossPaymentKey) return NextResponse.json({ error: '토스 결제키가 없어 환불할 수 없습니다.' }, { status: 400 });

    // Call Toss cancel API
    const key = process.env.TOSS_SECRET_KEY;
    const enc = Buffer.from(key + ':').toString('base64');
    const res = await fetch(`https://api.tosspayments.com/v1/payments/${payment.tossPaymentKey}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Basic ${enc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason: '관리자 환불' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '토스 환불 실패');

    // Remove ownership + mark payment as refunded (transaction)
    await prisma.$transaction([
      prisma.userToolOwnership.deleteMany({ where: { userId: payment.userId, toolId: payment.toolId } }),
      prisma.payment.update({ where: { id }, data: { status: 'REFUNDED' } }),
    ]);

    return NextResponse.json({ message: '환불이 완료되었습니다.', toss: data });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: e.message || '환불 실패' }, { status: 500 });
  }
}
