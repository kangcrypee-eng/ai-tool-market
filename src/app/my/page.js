'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/Badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fmt = (p) => `₩${(p || 0).toLocaleString()}`;
const CATS = ['general', 'automation', 'content', 'data', 'marketing', 'productivity'];

export default function MyPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tools');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', longDescription: '', category: 'general', imageUrl: '', toolUrl: '', toolContent: '', oneTimePrice: '', freeTrialDays: '30' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoad) return;
    if (!user) { router.push('/login'); return; }
    // Load all data in parallel
    Promise.all([
      fetch('/api/my').then(r => r.json()).then(setData),
      fetch('/api/referral').then(r => r.json()).then(setReferralData).catch(() => {}),
      loadMyEntries(),
    ]).finally(() => setLoading(false));
  }, [user, authLoad]);

  const load = () => fetch('/api/my').then(r => r.json()).then(setData);

  const submitTool = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const url = editId ? `/api/tools/${editId}` : '/api/tools';
      const r = await fetch(url, {
        method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, toolUrl: form.toolUrl || null, oneTimePrice: form.oneTimePrice ? parseInt(form.oneTimePrice, 10) : null, freeTrialDays: parseInt(form.freeTrialDays, 10) || 30 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setShowForm(false); setEditId(null); resetForm(); load();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const resetForm = () => setForm({ name: '', description: '', longDescription: '', category: 'general', imageUrl: '', toolUrl: '', toolContent: '', oneTimePrice: '', freeTrialDays: '30' });

  const editTool = (t) => {
    setEditId(t.id);
    setForm({ name: t.name, description: t.description, longDescription: t.longDescription || '', category: t.category, imageUrl: t.imageUrl || '', toolUrl: t.toolUrl || '', toolContent: t.toolContent || '', oneTimePrice: t.oneTimePrice?.toString() || '', freeTrialDays: t.freeTrialDays?.toString() || '30' });
    setShowForm(true); setTab('tools');
  };


  const [referralData, setReferralData] = useState(null);
  const [myEntries, setMyEntries] = useState([]);
  const loadMyEntries = async () => {
    try {
      const r = await fetch('/api/contests');
      const d = await r.json();
      const results = await Promise.all(
        (d.contests || []).slice(0, 5).map(c =>
          fetch(`/api/contests/${c.id}`).then(r2 => r2.json()).then(d2 => {
            const mine = (d2.contest?.entries || []).filter(e => e.user?.id === user?.id);
            return mine.map(e => ({ ...e, contestId: c.id, contestTitle: c.title }));
          }).catch(() => [])
        )
      );
      setMyEntries(results.flat());
    } catch {}
  };

  if (authLoad || loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-20 bg-bg-2 rounded-xl" /><div className="h-40 bg-bg-2 rounded-xl" /></div></div>;

  const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';

  const tabs = [
    { k: 'tools', l: `My tools (${data?.tools?.length || 0})` },
    { k: 'owned', l: `Owned (${data?.ownerships?.length || 0})` },
    { k: 'posts', l: `Posts (${data?.posts?.length || 0})` },
    ...(paymentEnabled ? [{ k: 'payments', l: `Payments` }] : []),
    { k: 'entries', l: '출품작' },
    { k: 'referral', l: '친구 초대' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-bg-1 border border-bg-3 rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-bg-3 flex items-center justify-center text-xl font-bold text-acc">{data?.profile?.name?.[0]}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold">{data?.profile?.name}</h1>
            {data?.profile?.badges?.map(b => <Badge key={b} code={b} />)}
          </div>
          <p className="text-xs text-tx-3">{data?.profile?.bio || data?.profile?.email}</p>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-tx-2"><b className="text-tx-0">{data?.tools?.length || 0}</b> tools</span>
            <span className="text-xs text-tx-2"><b className="text-tx-0">{data?.ownerships?.length || 0}</b> purchased</span>
            {data?.earnings?.total > 0 && <span className="text-xs text-acc-2"><b>{fmt(data.earnings.payout)}</b> earned</span>}
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); setTab('tools'); }}
          className="px-4 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">
          {showForm ? 'Cancel' : '+ New tool'}
        </button>
      </div>

      {/* Earnings bar (if creator) */}
      {data?.earnings?.total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center"><div className="text-sm font-semibold">{fmt(data.earnings.total)}</div><div className="text-[10px] text-tx-3">Revenue</div></div>
          <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center"><div className="text-sm font-semibold text-red-400">{fmt(data.earnings.fees)}</div><div className="text-[10px] text-tx-3">Fees (20%)</div></div>
          <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center"><div className="text-sm font-semibold text-acc-2">{fmt(data.earnings.payout)}</div><div className="text-[10px] text-tx-3">Settlement</div></div>
        </div>
      )}

      {/* Tool form */}
      {showForm && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">{editId ? 'Edit tool' : 'Register new tool'}</h2>
          <form onSubmit={submitTool} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-tx-2 mb-1">Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" required /></div>
              <div><label className="block text-xs text-tx-2 mb-1">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full">{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div><label className="block text-xs text-tx-2 mb-1">Short description *</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full" required /></div>
            <div><label className="block text-xs text-tx-2 mb-1">Long description (공개)</label><textarea value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value})} className="w-full h-20" /></div>
            <div><label className="block text-xs text-tx-2 mb-1">📝 Text content (결제 후 공개 — 프롬프트, 사용법 등)</label><textarea value={form.toolContent || ''} onChange={e => setForm({...form, toolContent: e.target.value})} className="w-full h-32" placeholder="프롬프트 원문, 사용 가이드, 세팅 방법 등" /><p className="text-[10px] text-tx-3 mt-1">무료 체험 기간 또는 결제 후에만 볼 수 있습니다</p></div>
            <div><label className="block text-xs text-tx-2 mb-1">Tool URL (선택)</label><input value={form.toolUrl || ''} onChange={e => setForm({...form, toolUrl: e.target.value})} className="w-full" placeholder="https://notion.so/my-tool" /><p className="text-[10px] text-tx-3 mt-1">파일 업로드는 등록 후 툴 상세 페이지에서 가능합니다.</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-tx-2 mb-1">Image URL</label><input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full" placeholder="https://..." /></div>
              <div><label className="block text-xs text-tx-2 mb-1">Free trial days</label><input type="number" value={form.freeTrialDays} onChange={e => setForm({...form, freeTrialDays: e.target.value})} className="w-full" min="0" /></div>
            </div>
            {paymentEnabled && (
              <div className="border-t border-bg-3 pt-3">
                <div className="text-xs font-semibold text-tx-2 mb-2">Price</div>
                <input type="number" value={form.oneTimePrice} onChange={e => setForm({...form, oneTimePrice: e.target.value})} className="w-full" placeholder="가격 (₩) — 비워두면 무료" min="0" />
                <p className="text-[10px] text-tx-3 mt-1">무료 체험 후 설정한 가격으로 유료 전환됩니다</p>
              </div>
            )}
            <button type="submit" disabled={busy} className="px-5 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
              {busy ? 'Saving...' : editId ? 'Update' : 'Register'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 bg-bg-1 border border-bg-3 rounded-lg p-1 mb-5">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 py-2 rounded-md text-[11px] font-medium transition-colors ${tab === t.k ? 'bg-bg-3 text-tx-0' : 'text-tx-3 hover:text-tx-1'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* My tools */}
      {tab === 'tools' && (
        <div className="space-y-2">
          {data?.tools?.length === 0 ? <Empty icon="🛠️" text="No tools yet" /> : data.tools.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-bg-1 border border-bg-3 rounded-lg hover:border-bg-4">
              <div className="w-9 h-9 rounded-lg bg-bg-2 flex items-center justify-center text-sm">🤖</div>
              <div className="flex-1 min-w-0">
                <Link href={`/tool/${t.id}`} className="text-xs font-semibold hover:text-acc">{t.name}</Link>
                <p className="text-[10px] text-tx-3">{t._count?.payments || 0} payments · <span className={t.status === 'APPROVED' ? 'text-acc-2' : t.status === 'PENDING' ? 'text-acc-5' : 'text-tx-3'}>{t.status}</span></p>
              </div>
              <button onClick={() => editTool(t)} className="text-xs text-acc hover:underline">Edit</button>
              <button onClick={async () => { if (!confirm(`"${t.name}" 툴을 삭제하시겠습니까?`)) return; try { const r = await fetch(`/api/tools/${t.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('삭제 실패'); load(); } catch (e) { alert(e.message); } }} className="text-xs text-red-400 hover:underline">Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Owned */}
      {tab === 'owned' && (
        <div className="space-y-2">
          {data?.ownerships?.length === 0 ? <Empty icon="📦" text="No purchased tools" /> : data.ownerships.map(o => (
            <Link key={o.id} href={`/tool/${o.tool.id}`} className="flex items-center gap-3 p-3 bg-bg-1 border border-bg-3 rounded-lg hover:border-bg-4">
              <div className="w-9 h-9 rounded-lg bg-bg-2 flex items-center justify-center text-sm">📦</div>
              <div className="flex-1"><h4 className="text-xs font-semibold">{o.tool.name}</h4><p className="text-[10px] text-tx-3">{o.tool.description}</p></div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2 font-semibold">Owned</span>
            </Link>
          ))}
        </div>
      )}

      {/* Posts */}
      {tab === 'posts' && (
        <div className="space-y-2">
          {data?.posts?.length === 0 ? <Empty icon="📝" text="No posts" /> : data.posts.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-bg-1 border border-bg-3 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-bg-2 flex items-center justify-center text-sm">{p.type === 'TIP' ? '💡' : p.type === 'QUESTION' ? '❓' : p.type === 'REVIEW' ? '⭐' : '🔧'}</div>
              <div className="flex-1"><h4 className="text-xs font-semibold">{p.title}</h4><p className="text-[10px] text-tx-3">{p._count?.likes || 0} likes · {p._count?.comments || 0} comments</p></div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-bg-3 text-tx-2 font-medium">{p.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
          {data?.payments?.length === 0 ? <Empty icon="💳" text="No payment history" /> : (
            <table className="w-full text-xs min-w-[400px]">
              <thead><tr className="bg-bg-2 text-tx-3 text-[10px]">
                <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                <th className="text-left px-4 py-2.5 font-semibold">Tool</th>
                <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                <th className="text-right px-4 py-2.5 font-semibold">Amount</th>
              </tr></thead>
              <tbody>
                {data.payments.map(p => (
                  <tr key={p.id} className="border-t border-bg-2 hover:bg-bg-2">
                    <td className="px-4 py-2.5 text-tx-3">{new Date(p.paidAt).toLocaleDateString('ko-KR')}</td>
                    <td className="px-4 py-2.5"><Link href={`/tool/${p.tool.id}`} className="hover:text-acc">{p.tool.name}</Link></td>
                    <td className="px-4 py-2.5"><span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${p.status === 'PAID' ? 'bg-acc-2/10 text-acc-2' : 'bg-red-500/10 text-red-400'}`}>{p.status === 'PAID' ? 'Paid' : 'Refunded'}</span></td>
                    <td className="px-4 py-2.5 text-right font-semibold">{fmt(p.amountTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Referral */}
      {/* Contest Entries */}
      {tab === 'entries' && (
        <div className="space-y-2">
          {myEntries.length === 0 ? (
            <div className="text-center py-12 text-tx-3"><div className="text-2xl mb-2">🏆</div><p className="text-xs">출품작이 없습니다</p></div>
          ) : (
            myEntries.map(e => (
              <Link key={e.id} href={`/contest/${e.contestId}/entry/${e.id}`} className="flex items-center gap-3 p-3 bg-bg-1 border border-bg-3 rounded-lg hover:border-bg-4">
                <div className="w-9 h-9 rounded-lg bg-bg-2 flex items-center justify-center text-sm">🏆</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold hover:text-acc">{e.title}</h4>
                  <p className="text-[10px] text-tx-3">{e.contestTitle} · ♥ {e._count?.votes || 0}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${e.status?.startsWith('WINNER') ? 'bg-acc-5/10 text-acc-5' : 'bg-bg-3 text-tx-2'}`}>{e.status}</span>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'referral' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-5">
          {!referralData ? (
            <div className="text-center py-8 text-tx-3 text-xs">불러오는 중...</div>
          ) : (
            <>
              <h3 className="text-sm font-semibold mb-4">🎯 친구 초대하고 수익 받기</h3>
              <p className="text-xs text-tx-2 mb-4">내가 초대한 빌더가 툴을 판매하면, 판매액의 3~7%가 나에게!</p>

              <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 mb-4">
                <p className="text-[10px] text-tx-3 mb-1">내 초대 링크</p>
                <div className="flex gap-2">
                  <input value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralData.referralCode || ''}`} readOnly className="flex-1 text-xs" />
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralData.referralCode}`); alert('복사됨!'); }}
                    className="px-3 py-1.5 rounded-md bg-acc text-bg-0 text-[11px] font-semibold hover:brightness-110 flex-shrink-0">복사</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-acc">{referralData.referralCount || 0}</div>
                  <div className="text-[10px] text-tx-3">초대한 친구</div>
                </div>
                <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-acc-2">{referralData.activeBuilders || 0}</div>
                  <div className="text-[10px] text-tx-3">활성 빌더</div>
                </div>
              </div>

              <div className="text-[10px] text-tx-3 space-y-1">
                <p>🎯 일반 — 초대 1명+ — 3%</p>
                <p>🥈 실버 — 활성 빌더 5명 — 5% + 배지</p>
                <p>🏆 골드 — 누적 판매 100만 — 7% + 프로필 노출</p>
              </div>
              {!process.env.NEXT_PUBLIC_PAYMENT_ENABLED && (
                <p className="text-[10px] text-tx-3 mt-3">💡 결제 기능 활성화 후 리워드가 적용됩니다. 현재는 초대 현황만 확인 가능합니다.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ icon, text }) {
  return <div className="text-center py-12 text-tx-3"><div className="text-2xl mb-2">{icon}</div><p className="text-xs">{text}</p></div>;
}
