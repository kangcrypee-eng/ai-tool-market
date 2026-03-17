import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    requireAdmin(req);
    const [userCount, toolCount, pendingCount, paymentAgg, users, tools, payments, posts] = await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.tool.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ _sum: { amountTotal: true, platformFee: true, creatorAmount: true }, _count: true }),
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.tool.findMany({ include: { creator: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.payment.findMany({
        include: { user: { select: { name: true } }, tool: { select: { name: true, creator: { select: { name: true } } } } },
        orderBy: { paidAt: 'desc' }, take: 50,
      }),
      prisma.post.findMany({
        include: { author: { select: { name: true } }, _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: 'desc' }, take: 50,
      }),
    ]);
    return NextResponse.json({
      stats: { userCount, toolCount, pendingCount, postCount: posts.length, totalRevenue: paymentAgg._sum.amountTotal || 0, totalFees: paymentAgg._sum.platformFee || 0, totalPayout: paymentAgg._sum.creatorAmount || 0, paymentCount: paymentAgg._count || 0 },
      users, tools, payments, posts,
    });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
