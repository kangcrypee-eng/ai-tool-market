import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/sanitize';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['json', 'csv', 'txt', 'zip', 'py', 'js', 'ts', 'xlsx', 'pdf', 'md'];
const BUCKET = 'tool-files';

export async function POST(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;

    const tool = await prisma.tool.findUnique({ where: { id } });
    if (!tool) return NextResponse.json({ error: '툴을 찾을 수 없습니다.' }, { status: 404 });
    if (tool.creatorId !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    if (!supabase) return NextResponse.json({ error: 'Storage가 설정되지 않았습니다.' }, { status: 500 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: '파일 크기는 50MB 이하여야 합니다.' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `허용되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')})` }, { status: 400 });
    }

    const cleanName = sanitizeInput(file.name, 200);
    const storagePath = `${id}/${randomUUID()}_${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return NextResponse.json({ error: '파일 업로드 실패: ' + uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const toolFile = await prisma.toolFile.create({
      data: {
        toolId: id,
        fileName: cleanName,
        fileUrl: publicUrl,
        fileSize: file.size,
        fileType: file.type || `application/${ext}`,
      },
    });

    return NextResponse.json({ file: toolFile }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '파일 업로드 실패' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    if (!fileId) return NextResponse.json({ error: 'fileId가 필요합니다.' }, { status: 400 });

    const toolFile = await prisma.toolFile.findUnique({ where: { id: fileId }, include: { tool: true } });
    if (!toolFile) return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    if (toolFile.tool.creatorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // Extract storage path from URL
    if (supabase) {
      const urlParts = toolFile.fileUrl.split(`${BUCKET}/`);
      if (urlParts[1]) {
        await supabase.storage.from(BUCKET).remove([urlParts[1]]);
      }
    }

    await prisma.toolFile.delete({ where: { id: fileId } });

    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
