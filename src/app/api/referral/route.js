import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const user = requireAuth(req);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { referralCode: true } });

    const referralCount = await prisma.user.count({ where: { referredBy: user.id } });
    const activeBuilders = await prisma.user.count({
      where: { referredBy: user.id, tools: { some: {} } },
    });

    return NextResponse.json({
      referralCode: dbUser?.referralCode,
      referralCount,
      activeBuilders,
    });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
