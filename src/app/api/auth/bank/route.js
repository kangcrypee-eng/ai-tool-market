import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    const user = requireAuth(req);
    const { bankName, accountNumber, accountHolder } = await req.json();

    if (!bankName || !accountNumber || !accountHolder) {
      return NextResponse.json({ error: '은행명, 계좌번호, 예금주를 모두 입력해주세요.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { bankName, accountNumber, accountHolder },
      select: { id: true, bankName: true, accountNumber: true, accountHolder: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '계좌 정보 저장 실패' }, { status: 500 });
  }
}
