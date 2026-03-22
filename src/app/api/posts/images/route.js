import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const BUCKET = 'post-images';

export async function POST(req) {
  try {
    const user = requireAuth(req);
    if (!supabase) return NextResponse.json({ error: 'Storage가 설정되지 않았습니다.' }, { status: 500 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error: '이미지가 필요합니다.' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: '이미지 크기는 5MB 이하여야 합니다.' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: '허용되지 않는 이미지 형식입니다. (jpg, png, gif, webp)' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return NextResponse.json({ error: '이미지 업로드 실패: ' + uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
  }
}
