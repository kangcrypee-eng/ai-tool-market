import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import { isInFreeTrial } from '@/lib/payment';
import { NextResponse } from 'next/server';

const BUCKET = 'tool-files';

export async function GET(req, { params }) {
  try {
    const { id, fileId } = params;

    const toolFile = await prisma.toolFile.findUnique({
      where: { id: fileId },
      include: { tool: true },
    });
    if (!toolFile || toolFile.toolId !== id) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const tool = toolFile.tool;
    const user = getAuthFromRequest(req);

    // Check access
    const isCreator = user && tool.creatorId === user.id;
    const isAdmin = user && user.role === 'ADMIN';
    let hasAccess = isCreator || isAdmin || isInFreeTrial(tool);

    if (!hasAccess && user) {
      const ownership = await prisma.userToolOwnership.findUnique({
        where: { userId_toolId: { userId: user.id, toolId: id } },
      });
      hasAccess = !!ownership;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: '접근 권한이 없습니다. 결제 후 다운로드 가능합니다.' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Storage가 설정되지 않았습니다.' }, { status: 500 });
    }

    // Extract storage path from URL
    const urlParts = toolFile.fileUrl.split(`${BUCKET}/`);
    const storagePath = urlParts[1];
    if (!storagePath) {
      return NextResponse.json({ error: '파일 경로를 찾을 수 없습니다.' }, { status: 500 });
    }

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: '다운로드 링크 생성 실패' }, { status: 500 });
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (e) {
    return NextResponse.json({ error: '다운로드 실패' }, { status: 500 });
  }
}
