const FEE_RATE = parseFloat(process.env.PLATFORM_FEE_RATE || '0.20');
const PG_RATE = 0.03;

function calculateFees(amount) {
  const pgFee = Math.round(amount * PG_RATE);
  const platformFee = Math.round(amount * FEE_RATE);
  const creatorAmount = amount - platformFee - pgFee;
  return { platformFee, pgFee, creatorAmount };
}

function getTrialDaysLeft(tool) {
  if (!tool.freeTrialDays) return 0;
  const published = new Date(tool.publishedAt);
  const trialEnd = new Date(published);
  trialEnd.setDate(trialEnd.getDate() + tool.freeTrialDays);
  const now = new Date();
  const diff = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function isInFreeTrial(tool) {
  return getTrialDaysLeft(tool) > 0;
}

async function confirmTossPayment(paymentKey, orderId, amount) {
  const key = process.env.TOSS_SECRET_KEY;
  const enc = Buffer.from(key + ':').toString('base64');
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: { Authorization: `Basic ${enc}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '결제 승인 실패');
  return data;
}

async function issueBillingKey(authKey, customerKey) {
  const key = process.env.TOSS_SECRET_KEY;
  const enc = Buffer.from(key + ':').toString('base64');
  const res = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
    method: 'POST',
    headers: { Authorization: `Basic ${enc}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ authKey, customerKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '빌링키 발급 실패');
  return data;
}

module.exports = { calculateFees, getTrialDaysLeft, isInFreeTrial, confirmTossPayment, issueBillingKey };
