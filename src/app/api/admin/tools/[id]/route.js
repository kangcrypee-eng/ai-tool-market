import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;
    const { status } = await req.json();
    if (!['APPROVED', 'REJECTED', 'HIDDEN'].includes(status)) return NextResponse.json({ error: '유효하지 않은 상태' }, { status: 400 });
    const tool = await prisma.tool.update({ where: { id }, data: { status } });
    return NextResponse.json({ tool });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '실패' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;

    // 트랜잭션으로 관련 데이터 순차 삭제 (FK 의존성)
    await prisma.$transaction(async (tx) => {
      await tx.postLike.deleteMany({ where: { post: { toolId: id } } });
      await tx.comment.deleteMany({ where: { toolId: id } });
      await tx.comment.deleteMany({ where: { post: { toolId: id } } });
      await tx.post.deleteMany({ where: { toolId: id } });
      await tx.payment.deleteMany({ where: { toolId: id } });
      await tx.userToolOwnership.deleteMany({ where: { toolId: id } });
      await tx.subscription.deleteMany({ where: { toolId: id } });
      await tx.tool.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
