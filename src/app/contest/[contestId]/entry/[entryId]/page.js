import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EntryDetail from './EntryDetail';

export async function generateMetadata({ params }) {
  const entry = await prisma.contestEntry.findUnique({
    where: { id: params.entryId },
    include: { user: { select: { name: true } }, contest: { select: { title: true } } },
  });
  if (!entry) return { title: 'Not Found' };
  return {
    title: `${entry.title} | ${entry.contest.title}`,
    description: entry.description.slice(0, 120),
    openGraph: {
      title: entry.title,
      description: `by ${entry.user.name} | ${entry.contest.title} | ♥ 추천하고 응원하세요!`,
    },
  };
}

export default async function EntryPage({ params }) {
  const entry = await prisma.contestEntry.findUnique({
    where: { id: params.entryId },
    include: {
      user: { select: { id: true, name: true, badges: true } },
      contest: { select: { id: true, title: true, status: true } },
      _count: { select: { votes: true } },
    },
  });
  if (!entry) notFound();
  return <EntryDetail entry={JSON.parse(JSON.stringify(entry))} />;
}
