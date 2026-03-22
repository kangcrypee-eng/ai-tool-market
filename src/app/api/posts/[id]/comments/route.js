import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';
import { createNotification } from '@/lib/notification';

export async function GET(req, { params }) {
  const { id } = params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ comments });
}

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: '내용 필수' }, { status: 400 });

    const cleanContent = sanitizeInput(content, LIMITS.comment);
    const comment = await prisma.comment.create({
      data: { userId: user.id, postId: id, content: cleanContent },
      include: { user: { select: { id: true, name: true } } },
    });
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, title: true } });
    if (post && post.authorId !== user.id) {
      createNotification({ userId: post.authorId, type: 'COMMENT', message: `${user.name}님이 "${post.title}" 글에 댓글을 남겼습니다.`, linkUrl: `/post/${id}` });
    }
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '실패' }, { status: 500 });
  }
}
