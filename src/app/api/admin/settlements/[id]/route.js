import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    requireAdmin(req);
    const { id } = params;
    const { status, adminNote } = await req.json();

    if (!['APPROVED', 'COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태' }, { status: 400 });
    }

    const data = { status, adminNote: adminNote || null };
    if (status === 'COMPLETED') data.completedAt = new Date();

    const settlement = await prisma.settlement.update({ where: { id }, data });
    return NextResponse.json({ settlement });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    if (e.message === 'FORBIDDEN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 });
    return NextResponse.json({ error: '처리 실패' }, { status: 500 });
  }
}
