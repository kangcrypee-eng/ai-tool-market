import { prisma } from '@/lib/prisma';
import { requireAuth, getAuthFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const user = getAuthFromRequest(req);

    const include = {
      author: { select: { id: true, name: true } },
      tool: { select: { id: true, name: true, category: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { comments: true, likes: true } },
    };
    if (user) {
      include.likes = { where: { userId: user.id }, select: { id: true } };
    }

    const post = await prisma.post.findUnique({ where: { id }, include });
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });

    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });

    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.postLike.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
