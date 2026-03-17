'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ToolDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const load = () => fetch(`/api/tools/${id}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-bg-2 rounded w-1/3" /><div className="h-48 bg-bg-2 rounded-xl" /></div></div>;
  if (!data?.tool) return <div className="text-center py-20 text-tx-3">Tool not found</div>;

  const { tool, freeTrial, trialDaysLeft, userAccess } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-4 inline-flex items-center gap-1">← Back to list</Link>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-[45%] aspect-[16/10] rounded-xl bg-gradient-to-br from-bg-2 to-bg-3 flex items-center justify-center text-5xl border border-bg-3">🤖</div>
        <div className="flex-1">
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-bg-3 text-tx-2">{tool.category}</span>
            {freeTrial && <span className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2">{trialDaysLeft}d free trial</span>}
            {userAccess?.hasAccess && <span className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2">✓ Access</span>}
          </div>
          <h1 className="text-xl font-semibold mb-1">{tool.name}</h1>
          <p className="text-xs text-tx-3 mb-3">by {tool.creator?.name}</p>
          <p className="text-xs text-tx-2 leading-relaxed mb-5">{tool.description}</p>

          {/* Tool access link */}
          {tool.toolUrl && (
            <a href={tool.toolUrl} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 text-center block mb-3">
              🔗 툴 사용하기 →
            </a>
          )}

          {/* Status badges */}
          {freeTrial ? (
            <div className="w-full py-3 rounded-lg bg-acc-2/10 text-acc-2 text-center text-xs font-semibold">✓ 무료 체험 중 · {trialDaysLeft}일 남음</div>
          ) : (
            <div className="w-full py-3 rounded-lg bg-bg-2 border border-bg-3 text-tx-2 text-center text-xs">
              💳 결제 기능 개발 중 · 현재 모든 툴은 무료로 이용 가능합니다
            </div>
          )}
        </div>
      </div>

      {/* Long description */}
      {tool.longDescription && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-2">상세 설명</h2>
          <p className="text-xs text-tx-2 leading-relaxed whitespace-pre-line">{tool.longDescription}</p>
        </div>
      )}

      {/* Tool URL section */}
      {tool.toolUrl && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-2">툴 링크</h2>
          <a href={tool.toolUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-acc hover:underline break-all">{tool.toolUrl}</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[['Subscribers', tool._count?.subscriptions, 'text-acc'], ['Views', tool._count?.payments || 0, 'text-acc-2'], ['Reviews', tool.comments?.length, 'text-acc-3']].map(([l, n, c]) => (
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
