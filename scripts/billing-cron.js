const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const FEE = 0.20, PG = 0.03;

async function run() {
  console.log(`[${new Date().toISOString()}] Billing start`);
  const now = new Date();
  const due = await prisma.subscription.findMany({
    where: { status: 'ACTIVE', nextBillingAt: { lte: now } },
    include: { tool: { select: { name: true } }, user: { select: { email: true } } },
  });
  console.log(`Due: ${due.length}`);

  for (const s of due) {
    try {
      const pgFee = Math.round(s.price * PG);
      const platformFee = Math.round(s.price * FEE);
      const creatorAmount = s.price - platformFee - pgFee;
      const next = new Date(now); next.setDate(next.getDate() + 30);

      await prisma.$transaction([
        prisma.payment.create({ data: { userId: s.userId, toolId: s.toolId, subscriptionId: s.id, paymentType: 'SUBSCRIPTION', amountTotal: s.price, platformFee, pgFee, creatorAmount, tossOrderId: `sub_${s.id}_${Date.now()}` } }),
        prisma.subscription.update({ where: { id: s.id }, data: { lastBilledAt: now, nextBillingAt: next } }),
      ]);
      console.log(`  OK: ${s.user.email} -> ${s.tool.name}`);
    } catch (e) {
      console.error(`  FAIL: ${s.user.email} - ${e.message}`);
    }
  }
  console.log(`[${new Date().toISOString()}] Done`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
