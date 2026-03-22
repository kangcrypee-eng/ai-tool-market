import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypee-ai.vercel.app';

  const tools = await prisma.tool.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, updatedAt: true },
  });

  const posts = await prisma.post.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const toolPages = tools.map(t => ({
    url: `${baseUrl}/tool/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const postPages = posts.map(p => ({
    url: `${baseUrl}/post/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...postPages];
}
