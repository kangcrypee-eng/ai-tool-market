import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;

    // 관련 likes, comments 먼저 삭제
    await prisma.postLike.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
