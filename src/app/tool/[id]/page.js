import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isInFreeTrial, getTrialDaysLeft } from '@/lib/payment';
import ToolDetailClient from './ToolDetailClient';

const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

export default async function ToolDetailPage({ params }) {
  const { id } = params;

  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, bio: true } },
      files: { orderBy: { createdAt: 'desc' } },
      comments: { where: { postId: null }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { payments: true } },
    },
  }).catch(() => null);

  if (tool) {
    prisma.tool.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  }

  if (!tool) {
    return <div className="text-center py-20 text-tx-3">Tool not found</div>;
  }

  let ownership = null;
  if (user) {
    ownership = await prisma.userToolOwnership.findUnique({
      where: { userId_toolId: { userId: user.id, toolId: id } },
    }).catch(() => null);
  }

  const freeTrial = isInFreeTrial(tool);
  const trialDaysLeft = getTrialDaysLeft(tool);
  const isCreator = user && tool.creatorId === user.id;
  const isAdmin = user && user.role === 'ADMIN';
  const isPaid = tool.oneTimePrice && tool.oneTimePrice > 0;

  let hasAccess;
  if (!paymentEnabled) {
    hasAccess = true;
  } else {
    hasAccess = !!ownership || freeTrial || !isPaid;
  }

  const isLocked = paymentEnabled && isPaid && !hasAccess && !isCreator && !isAdmin;

  const responseTool = { ...tool };
  if (isLocked) {
    responseTool.toolUrl = null;
    responseTool.toolContent = null;
    responseTool.files = [];
  }

  const initialData = {
    tool: responseTool,
    freeTrial,
    trialDaysLeft,
    isLocked,
    userAccess: {
      owned: !!ownership,
      hasAccess: hasAccess || !!isCreator || !!isAdmin,
    },
  };

  return <ToolDetailClient initialData={initialData} />;
}
