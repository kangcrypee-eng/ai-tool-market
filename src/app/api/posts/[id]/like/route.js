import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createNotification } from '@/lib/notification';

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const existing = await prisma.postLike.findUnique({ where: { userId_postId: { userId: user.id, postId: id } } });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.postLike.create({ data: { userId: user.id, postId: id } });
      const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, title: true } });
      if (post && post.authorId !== user.id) {
        createNotification({ userId: post.authorId, type: 'LIKE', message: `${user.name}님이 "${post.title}" 글을 좋아합니다.`, linkUrl: `/post/${id}` });
      }
      return NextResponse.json({ liked: true });
    }
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '실패' }, { status: 500 });
  }
}
