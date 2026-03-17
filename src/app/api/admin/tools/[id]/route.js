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

    // 관련 데이터 순서대로 삭제
    await prisma.postLike.deleteMany({ where: { post: { toolId: id } } });
    await prisma.comment.deleteMany({ where: { toolId: id } });
    await prisma.comment.deleteMany({ where: { post: { toolId: id } } });
    await prisma.post.deleteMany({ where: { toolId: id } });
    await prisma.payment.deleteMany({ where: { toolId: id } });
    await prisma.userToolOwnership.deleteMany({ where: { toolId: id } });
    await prisma.subscription.deleteMany({ where: { toolId: id } });
    await prisma.tool.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
