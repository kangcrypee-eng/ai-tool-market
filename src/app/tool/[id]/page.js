'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

const fmt = (p) => (!p || p === 0) ? 'Free' : `₩${p.toLocaleString()}`;
const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function ToolDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [paying, setPaying] = useState(false);

  const load = () => fetch(`/api/tools/${id}`).then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { if (id) load(); }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!user) return router.push('/login');
    const r = await fetch(`/api/tools/${id}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment, rating }),
    });
    if (r.ok) { setComment(''); load(); }
  };

  const handleOneTimePurchase = async () => {
    if (!user) return router.push('/login');
    setPaying(true);
    try {
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!tossClientKey || !window.TossPayments) throw new Error('결제 시스템을 로드할 수 없습니다.');
      const tossPayments = window.TossPayments(tossClientKey);
      const orderId = `order_${tool.id}_${user.id}_${Date.now()}`;
      await tossPayments.requestPayment('카드', {
        amount: tool.oneTimePrice,
        orderId,
        orderName: tool.name,
        customerName: user.name,
        successUrl: `${window.location.origin}/api/payments/toss-success`,
        failUrl: `${window.location.origin}/api/payments/toss-fail`,
      });
    } catch (e) {
      if (e.code !== 'USER_CANCEL') alert(e.message || '결제 중 오류가 발생했습니다.');
    } finally { setPaying(false); }
  };

  const handleSubscribe = async () => {
    if (!user) return router.push('/login');
    setPaying(true);
    try {
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!tossClientKey || !window.TossPayments) throw new Error('결제 시스템을 로드할 수 없습니다.');
      const tossPayments = window.TossPayments(tossClientKey);
      await tossPayments.requestBillingKeyIssue('카드', {
        customerKey: user.id,
        successUrl: `${window.location.origin}/api/subscriptions/toss-success?toolId=${tool.id}`,
        failUrl: `${window.location.origin}/api/subscriptions/toss-fail`,
      });
    } catch (e) {
      if (e.code !== 'USER_CANCEL') alert(e.message || '구독 등록 중 오류가 발생했습니다.');
    } finally { setPaying(false); }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-bg-2 rounded w-1/3" /><div className="h-48 bg-bg-2 rounded-xl" /></div></div>;
  if (!data?.tool) return <div className="text-center py-20 text-tx-3">Tool not found</div>;

  const { tool, freeTrial, trialDaysLeft, userAccess, isLocked } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Script src="https://js.tosspayments.com/v1/payment" strategy="lazyOnload" />

      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-4 inline-flex items-center gap-1">← Back to list</Link>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-[45%] aspect-[16/10] rounded-xl bg-gradient-to-br from-bg-2 to-bg-3 flex items-center justify-center text-5xl border border-bg-3">
          {isLocked ? '🔒' : '🤖'}
        </div>
        <div className="flex-1">
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-bg-3 text-tx-2">{tool.category}</span>
            {freeTrial && <span className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2">{trialDaysLeft}d free trial</span>}
            {userAccess?.owned && <span className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2">Owned</span>}
            {userAccess?.subscribed && <span className="text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc">Subscribed</span>}
            {isLocked && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400">🔒 Locked</span>}
          </div>
          <h1 className="text-xl font-semibold mb-1">{tool.name}</h1>
          <p className="text-xs text-tx-3 mb-3">by {tool.creator?.name}</p>
          <p className="text-xs text-tx-2 leading-relaxed mb-5">{tool.description}</p>

          {/* Access granted: show tool link */}
          {userAccess?.hasAccess && tool.toolUrl && /^https?:\/\//i.test(tool.toolUrl) && (
            <a href={tool.toolUrl} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 text-center block mb-3">
              🔗 툴 사용하기 →
            </a>
          )}

          {/* Free trial badge */}
          {freeTrial && (
            <div className="w-full py-3 rounded-lg bg-acc-2/10 text-acc-2 text-center text-xs font-semibold mb-3">
              ✓ 무료 체험 중 · {trialDaysLeft}일 남음
            </div>
          )}

          {/* Locked: show purchase buttons */}
          {isLocked && (
            <div className="space-y-2">
              <div className="w-full py-3 rounded-lg bg-bg-2 border border-bg-3 text-tx-2 text-center text-xs mb-2">
                🔒 무료 체험 기간이 종료되었습니다
              </div>
              {tool.isOneTimeEnabled && (
                <button onClick={handleOneTimePurchase} disabled={paying}
                  className="w-full py-3 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                  {paying ? '처리 중...' : `1회 구매 — ${fmt(tool.oneTimePrice)}`}
                </button>
              )}
              {tool.isSubscriptionEnabled && (
                <button onClick={handleSubscribe} disabled={paying}
                  className="w-full py-3 rounded-lg bg-acc-2 text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                  {paying ? '처리 중...' : `월 구독 — ${fmt(tool.subscriptionPrice)}/mo`}
                </button>
              )}
              {!tool.isOneTimeEnabled && !tool.isSubscriptionEnabled && (
                <div className="text-[11px] text-tx-3 text-center">크리에이터가 아직 가격을 설정하지 않았습니다.</div>
              )}
            </div>
          )}

          {/* Not locked and not free trial - already purchased/subscribed */}
          {!isLocked && !freeTrial && userAccess?.hasAccess && (
            <div className="w-full py-3 rounded-lg bg-acc-2/10 text-acc-2 text-center text-xs font-semibold">
              ✓ {userAccess.owned ? '구매 완료' : '구독 중'}
            </div>
          )}
        </div>
      </div>

      {/* File downloads (signed URL — only when access granted) */}
      {userAccess?.hasAccess && tool.files?.length > 0 && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">📁 파일 다운로드</h2>
          <div className="space-y-2">
            {tool.files.map(f => (
              <a key={f.id} href={`/api/tools/${tool.id}/files/${f.id}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-2 border border-bg-3 hover:border-acc/30 transition-colors">
                <span className="text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{f.fileName}</div>
                  <div className="text-[10px] text-tx-3">{fmtSize(f.fileSize)} · {f.fileType}</div>
                </div>
                <span className="text-[10px] text-acc flex-shrink-0">다운로드 →</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Locked files placeholder */}
      {isLocked && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-bg-1/80 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-xs text-tx-3">🔒 결제 후 접근 가능</span>
          </div>
          <h2 className="text-sm font-semibold mb-3 opacity-30">📁 파일 · 📝 텍스트 콘텐츠</h2>
          <div className="h-16 bg-bg-2 rounded-lg opacity-20" />
        </div>
      )}

      {/* Text content (only when access granted) */}
      {userAccess?.hasAccess && tool.toolContent && (
        <div className="bg-bg-1 border border-acc/20 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3.5 bg-acc-2 rounded" />📝 텍스트 콘텐츠
          </h2>
          <div className="text-xs text-tx-2 leading-relaxed whitespace-pre-line">{tool.toolContent}</div>
        </div>
      )}

      {/* Long description (always visible) */}
      {tool.longDescription && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-2">상세 설명</h2>
          <p className="text-xs text-tx-2 leading-relaxed whitespace-pre-line">{tool.longDescription}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[['Subscribers', tool._count?.subscriptions, 'text-acc'], ['Payments', tool._count?.payments || 0, 'text-acc-2'], ['Reviews', tool.comments?.length, 'text-acc-3']].map(([l, n, c]) => (
          <div key={l} className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center">
            <div className={`text-lg font-semibold ${c}`}>{n || 0}</div>
            <div className="text-[10px] text-tx-3 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="border-t border-bg-3 pt-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><span className="w-0.5 h-3.5 bg-acc rounded" />리뷰</h2>
        {user && (
          <form onSubmit={addComment} className="mb-5 pb-5 border-b border-bg-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-tx-2">평점:</span>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)} className={`text-sm ${n <= rating ? 'text-acc-5' : 'text-bg-3'}`}>★</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1" placeholder="리뷰를 작성하세요..." required />
              <button type="submit" className="px-4 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">등록</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {tool.comments?.length === 0 && <p className="text-center text-tx-3 py-6 text-xs">아직 리뷰가 없습니다</p>}
          {tool.comments?.map(c => (
            <div key={c.id} className="flex gap-3 p-3 bg-bg-2 border border-bg-3 rounded-lg">
              <div className="w-7 h-7 rounded-md bg-bg-3 flex items-center justify-center text-[10px] font-bold text-tx-2 flex-shrink-0">{c.user?.name?.[0]}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{c.user?.name}</span>
                  {c.rating && <span className="text-[10px] text-acc-5">{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</span>}
                </div>
                <p className="text-xs text-tx-2 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
