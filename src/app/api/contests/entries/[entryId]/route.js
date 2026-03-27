import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const user = requireAuth(req);
    const { entryId } = params;

    const entry = await prisma.contestEntry.findUnique({ where: { id: entryId } });
    if (!entry) return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
    if (entry.userId !== user.id && user.role !== 'ADMIN') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    const { title, description, videoUrl, tryUrl, images } = await req.json();
    const updated = await prisma.contestEntry.update({
      where: { id: entryId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(tryUrl !== undefined && { tryUrl: tryUrl || null }),
        ...(images !== undefined && { images: Array.isArray(images) ? images.filter(u => typeof u === 'string').slice(0, 5) : entry.images }),
      },
    });
    return NextResponse.json({ entry: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = requireAuth(req);
    const { entryId } = params;

    const entry = await prisma.contestEntry.findUnique({ where: { id: entryId } });
    if (!entry) return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
    if (entry.userId !== user.id && user.role !== 'ADMIN') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    await prisma.contestVote.deleteMany({ where: { entryId } });
    await prisma.contestEntry.delete({ where: { id: entryId } });

    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
