import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });

    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
