import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [posts, tools] = await Promise.all([
    prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, badges: true } },
        tool: { select: { id: true, name: true, category: true, oneTimePrice: true, freeTrialDays: true, publishedAt: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).catch(() => []),
    prisma.tool.findMany({
      where: { status: 'APPROVED' },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { payments: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ]);

  return <HomeClient initialPosts={posts} initialTools={tools} />;
}
