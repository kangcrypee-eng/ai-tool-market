import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const MIN_SETTLEMENT = 10000;

export async function GET(req) {
  try {
    const user = requireAuth(req);
    const settlements = await prisma.settlement.findMany({
      where: { creatorId: user.id },
      orderBy: { requestedAt: 'desc' },
    });
    return NextResponse.json({ settlements });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = requireAuth(req);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser.bankName || !dbUser.accountNumber) {
      return NextResponse.json({ error: '계좌 정보를 먼저 등록해주세요.' }, { status: 400 });
    }

    // Calculate available amount
    const payments = await prisma.payment.findMany({
      where: { tool: { creatorId: user.id }, status: 'PAID' },
      select: { creatorAmount: true },
    });
    const totalEarned = payments.reduce((sum, p) => sum + p.creatorAmount, 0);

    const settled = await prisma.settlement.findMany({
      where: { creatorId: user.id, status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] } },
      select: { amount: true },
    });
    const totalSettled = settled.reduce((sum, s) => sum + s.amount, 0);
    const available = totalEarned - totalSettled;

    if (available < MIN_SETTLEMENT) {
      return NextResponse.json({ error: `정산 최소 금액은 ${MIN_SETTLEMENT.toLocaleString()}원입니다. (현재 ${available.toLocaleString()}원)` }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        creatorId: user.id,
        amount: available,
        bankName: dbUser.bankName,
        accountNumber: dbUser.accountNumber,
        accountHolder: dbUser.accountHolder,
      },
    });

    return NextResponse.json({ settlement }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '정산 요청 실패' }, { status: 500 });
  }
}
