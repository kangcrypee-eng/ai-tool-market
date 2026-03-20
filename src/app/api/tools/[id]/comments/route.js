import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, LIMITS } from '@/lib/sanitize';

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const { content, rating } = await req.json();
    if (!content) return NextResponse.json({ error: '내용 필수' }, { status: 400 });

    const cleanContent = sanitizeInput(content, LIMITS.comment);
    const parsedRating = rating ? parseInt(rating, 10) : null;
    const validRating = parsedRating && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : null;
    const comment = await prisma.comment.create({
      data: { userId: user.id, toolId: id, content: cleanContent, rating: validRating },
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '실패' }, { status: 500 });
  }
}
