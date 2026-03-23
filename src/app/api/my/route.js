import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = requireAuth(req);
    const [profile, tools, ownerships, payments, posts] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, bio: true, role: true, bankName: true, accountNumber: true, accountHolder: true, createdAt: true } }),
      prisma.tool.findMany({
        where: { creatorId: user.id },
        include: { _count: { select: { payments: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userToolOwnership.findMany({
        where: { userId: user.id },
        include: { tool: { select: { id: true, name: true, description: true, category: true } } },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { userId: user.id },
        include: { tool: { select: { id: true, name: true } } },
        orderBy: { paidAt: 'desc' },
        take: 30,
      }),
      prisma.post.findMany({
        where: { authorId: user.id },
        include: { _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Creator earnings
    const earnings = await prisma.payment.aggregate({
      where: { tool: { creatorId: user.id }, status: 'PAID' },
      _sum: { amountTotal: true, platformFee: true, creatorAmount: true },
    });

    return NextResponse.json({
      profile, tools, ownerships, payments, posts,
      earnings: {
        total: earnings._sum.amountTotal || 0,
        fees: earnings._sum.platformFee || 0,
        payout: earnings._sum.creatorAmount || 0,
      },
    });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
