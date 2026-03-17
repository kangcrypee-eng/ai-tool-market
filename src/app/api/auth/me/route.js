import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
