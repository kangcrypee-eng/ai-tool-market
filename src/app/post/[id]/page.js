import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import PostDetailClient from './PostDetailClient';

export default async function PostDetailPage({ params }) {
  const { id } = params;

  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  const include = {
    author: { select: { id: true, name: true } },
    tool: { select: { id: true, name: true, category: true } },
    comments: {
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    },
    _count: { select: { comments: true, likes: true } },
  };
  if (user) {
    include.likes = { where: { userId: user.id }, select: { id: true } };
  }

  const post = await prisma.post.findUnique({ where: { id }, include }).catch(() => null);

  return <PostDetailClient initialPost={post} />;
}
