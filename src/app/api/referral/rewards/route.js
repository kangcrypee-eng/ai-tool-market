import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const user = requireAuth(req);
    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: user.id },
      include: { referred: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ rewards });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
