'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const fmt = (p) => `₩${(p || 0).toLocaleString()}`;
const typeLabel = { TOOL_SHARE: 'Tool', TIP: 'Tip', QUESTION: 'Q&A', REVIEW: 'Review' };
const typeCls = { TOOL_SHARE: 'bg-acc/10 text-acc', TIP: 'bg-acc-5/10 text-acc-5', QUESTION: 'bg-acc-4/10 text-acc-4', REVIEW: 'bg-acc-2/10 text-acc-2' };

export default function AdminPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);
  const [contestForm, setContestForm] = useState({ title: '', description: '', bannerText: '', startDate: '', endDate: '', votingEnd: '', resultDate: '', prizes: '', rules: '', status: 'UPCOMING' });
  const [contests, setContests] = useState([]);
  const [contestBusy, setContestBusy] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);

  useEffect(() => {
    if (authLoad) return;
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user, authLoad]);

  const [loadError, setLoadError] = useState(null);
  const load = () => {
    setLoadError(null);
    return fetch('/api/admin')
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setData(d); })
      .catch(e => setLoadError(e.message || '데이터 로드 실패'))
      .finally(() => setLoading(false));
  };

  const setStatus = async (toolId, status) => {
    await fetch(`/api/admin/tools/${toolId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const deleteTool = async (toolId, name) => {
    if (!confirm(`"${name}" 툴과 관련된 모든 데이터를 삭제합니다. 계속하시겠습니까?`)) return;
    setDeleting(toolId);
    try {
      const r = await fetch(`/api/admin/tools/${toolId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('삭제 실패');
      load();
    } catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const deletePost = async (postId, title) => {
    if (!confirm(`"${title}" 게시글을 삭제합니다. 계속하시겠습니까?`)) return;
    setDeleting(postId);
    try {
      const r = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('삭제 실패');
      load();
    } catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  if (authLoad || loading) return <div className="max-w-5xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-bg-2 rounded w-1/4" /><div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-bg-2 rounded-xl" />)}</div></div></div>;
  if (loadError) return <div className="max-w-5xl mx-auto px-4 py-8 text-center"><p className="text-sm text-red-400 mb-3">{loadError}</p><button onClick={load} className="text-xs text-acc hover:underline">다시 시도</button></div>;

  const s = data?.stats;

  const loadContests = () => fetch('/api/contests').then(r => r.json()).then(d => setContests(d.contests || [])).catch(() => {});

  const saveContest = async (e) => {
    e.preventDefault();
    setContestBusy(true);
    try {
      const method = selectedContest ? 'PUT' : 'POST';
      const url = selectedContest ? `/api/contests/${selectedContest}` : '/api/contests';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contestForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setContestForm({ title: '', description: '', bannerText: '', startDate: '', endDate: '', votingEnd: '', resultDate: '', prizes: '', rules: '', status: 'UPCOMING' });
      setSelectedContest(null);
      loadContests();
    } catch (e) { alert(e.message); }
    finally { setContestBusy(false); }
  };

  const setWinner = async (contestId, entryId, status) => {
    await fetch(`/api/admin/contests/${contestId}/winners`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: [{ entryId, status }] }),
    });
    loadContests();
    if (selectedContest === contestId) loadContestEntries(contestId);
  };

  const [contestEntries, setContestEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [expandedContest, setExpandedContest] = useState(null);

  const loadContestEntries = async (contestId) => {
    setEntriesLoading(true);
    try {
      const r = await fetch(`/api/contests/${contestId}`);
      const d = await r.json();
      setContestEntries(d.contest?.entries || []);
    } finally { setEntriesLoading(false); }
  };

  const setContestStatus = async (contestId, status) => {
    await fetch(`/api/contests/${contestId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadContests();
  };

  const tabs = ['overview', 'tools', 'posts', 'users', 'payments', 'contests'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-5">Admin dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          ['Users', s?.userCount, 'text-acc'],
          ['Tools', s?.toolCount, 'text-acc-2'],
          ['Posts', s?.postCount, 'text-acc-4'],
          ['Revenue', fmt(s?.totalRevenue), 'text-tx-0'],
          ['Fees', fmt(s?.totalFees), 'text-acc'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-bg-2 border border-bg-3 rounded-lg p-3">
            <div className={`text-lg font-semibold ${c}`}>{v}</div>
            <div className="text-[10px] text-tx-3">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-0.5 bg-bg-1 border border-bg-3 rounded-lg p-1 mb-5">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-[11px] font-medium capitalize ${tab === t ? 'bg-bg-3 text-tx-0' : 'text-tx-3'}`}>
            {t}{t === 'tools' && s?.pendingCount ? ` (${s.pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-1 border border-bg-3 rounded-xl p-4">
            <h3 className="text-xs font-semibold mb-3">Revenue breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-tx-2">Total revenue</span><span className="font-semibold">{fmt(s?.totalRevenue)}</span></div>
              <div className="flex justify-between"><span className="text-tx-2">Platform fees (20%)</span><span className="font-semibold text-acc">{fmt(s?.totalFees)}</span></div>
              <div className="flex justify-between"><span className="text-tx-2">Creator payouts</span><span className="font-semibold text-acc-2">{fmt(s?.totalPayout)}</span></div>
              <div className="flex justify-between pt-2 border-t border-bg-3"><span className="text-tx-2">Total payments</span><span className="font-semibold">{s?.paymentCount}</span></div>
            </div>
          </div>
          <div className="bg-bg-1 border border-bg-3 rounded-xl p-4">
            <h3 className="text-xs font-semibold mb-3">Platform</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-tx-2">Total tools</span><span className="font-semibold">{s?.toolCount}</span></div>
              <div className="flex justify-between"><span className="text-tx-2">Pending approval</span><span className="font-semibold text-acc-5">{s?.pendingCount}</span></div>
              <div className="flex justify-between"><span className="text-tx-2">Total posts</span><span className="font-semibold">{s?.postCount}</span></div>
              <div className="flex justify-between"><span className="text-tx-2">Users</span><span className="font-semibold">{s?.userCount}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tools management */}
      {tab === 'tools' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
          {data?.tools?.length === 0 ? (
            <div className="text-center py-12 text-tx-3 text-xs">No tools</div>
          ) : (
            <table className="w-full text-xs min-w-[500px]">
              <thead><tr className="bg-bg-2 text-tx-3 text-[10px]">
                <th className="text-left px-4 py-2.5">Tool</th>
                <th className="text-left px-4 py-2.5">Creator</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Actions</th>
              </tr></thead>
              <tbody>{data?.tools?.map(t => (
                <tr key={t.id} className="border-t border-bg-2 hover:bg-bg-2">
                  <td className="px-4 py-2.5 font-semibold">{t.name}</td>
                  <td className="px-4 py-2.5 text-tx-3">{t.creator?.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      t.status === 'APPROVED' ? 'bg-acc-2/10 text-acc-2' :
                      t.status === 'PENDING' ? 'bg-acc-5/10 text-acc-5' :
                      t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                      'bg-bg-3 text-tx-3'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-1">
                    {t.status !== 'APPROVED' && (
                      <button onClick={() => setStatus(t.id, 'APPROVED')} className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2 hover:bg-acc-2/20">Approve</button>
                    )}
                    {t.status !== 'HIDDEN' && (
                      <button onClick={() => setStatus(t.id, 'HIDDEN')} className="text-[10px] px-2 py-0.5 rounded bg-acc-5/10 text-acc-5 hover:bg-acc-5/20">Hide</button>
                    )}
                    <button onClick={() => deleteTool(t.id, t.name)} disabled={deleting === t.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                      {deleting === t.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Posts management */}
      {tab === 'posts' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
          {data?.posts?.length === 0 ? (
            <div className="text-center py-12 text-tx-3 text-xs">No posts</div>
          ) : (
            <table className="w-full text-xs">
              <thead><tr className="bg-bg-2 text-tx-3 text-[10px]">
                <th className="text-left px-4 py-2.5">Title</th>
                <th className="text-left px-4 py-2.5">Author</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Engagement</th>
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-right px-4 py-2.5">Actions</th>
              </tr></thead>
              <tbody>{data?.posts?.map(p => (
                <tr key={p.id} className="border-t border-bg-2 hover:bg-bg-2">
                  <td className="px-4 py-2.5 font-semibold max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-2.5 text-tx-3">{p.author?.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${typeCls[p.type] || 'bg-bg-3 text-tx-3'}`}>
                      {typeLabel[p.type] || p.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-tx-3">
                    ♥ {p._count?.likes || 0} · 💬 {p._count?.comments || 0}
                  </td>
                  <td className="px-4 py-2.5 text-tx-3">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => deletePost(p.id, p.title)} disabled={deleting === p.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                      {deleting === p.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead><tr className="bg-bg-2 text-tx-3 text-[10px]"><th className="text-left px-4 py-2.5">Name</th><th className="text-left px-4 py-2.5">Email</th><th className="text-left px-4 py-2.5">Role</th><th className="text-left px-4 py-2.5">Joined</th></tr></thead>
            <tbody>{data?.users?.map(u => (
              <tr key={u.id} className="border-t border-bg-2 hover:bg-bg-2">
                <td className="px-4 py-2.5 font-semibold">{u.name}</td>
                <td className="px-4 py-2.5 text-tx-3">{u.email}</td>
                <td className="px-4 py-2.5"><span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${u.role === 'ADMIN' ? 'bg-acc-4/10 text-acc-4' : 'bg-bg-3 text-tx-2'}`}>{u.role}</span></td>
                <td className="px-4 py-2.5 text-tx-3">{new Date(u.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
          {data?.payments?.length === 0 ? (
            <div className="text-center py-12 text-tx-3 text-xs">No payments</div>
          ) : (
            <table className="w-full text-xs min-w-[500px]">
              <thead><tr className="bg-bg-2 text-tx-3 text-[10px]"><th className="text-left px-4 py-2.5">Date</th><th className="text-left px-4 py-2.5">User</th><th className="text-left px-4 py-2.5">Tool</th><th className="text-right px-4 py-2.5">Amount</th><th className="text-right px-4 py-2.5">Fee</th><th className="text-right px-4 py-2.5">Payout</th></tr></thead>
              <tbody>{data?.payments?.map(p => (
                <tr key={p.id} className="border-t border-bg-2 hover:bg-bg-2">
                  <td className="px-4 py-2.5 text-tx-3">{new Date(p.paidAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-2.5">{p.user?.name}</td>
                  <td className="px-4 py-2.5 font-semibold">{p.tool?.name}</td>
                  <td className="px-4 py-2.5 text-right">{fmt(p.amountTotal)}</td>
                  <td className="px-4 py-2.5 text-right text-red-400">{fmt(p.platformFee)}</td>
                  <td className="px-4 py-2.5 text-right text-acc-2">{fmt(p.creatorAmount)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Contests */}
      {tab === 'contests' && (
        <div className="space-y-6">
          {/* Contest form */}
          <div className="bg-bg-1 border border-bg-3 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">{selectedContest ? '콘테스트 수정' : '새 콘테스트'}</h3>
            <form onSubmit={saveContest} className="space-y-3">
              <input value={contestForm.title} onChange={e => setContestForm({...contestForm, title: e.target.value})} className="w-full" placeholder="제목 *" required />
              <textarea value={contestForm.description} onChange={e => setContestForm({...contestForm, description: e.target.value})} className="w-full h-20 resize-none" placeholder="설명 (마크다운) *" required />
              <input value={contestForm.bannerText} onChange={e => setContestForm({...contestForm, bannerText: e.target.value})} className="w-full" placeholder="배너 한 줄 요약" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] text-tx-3 mb-1">접수 시작일 *</label><input type="date" value={contestForm.startDate} onChange={e => setContestForm({...contestForm, startDate: e.target.value})} className="w-full" required /></div>
                <div><label className="block text-[10px] text-tx-3 mb-1">접수 마감일 *</label><input type="date" value={contestForm.endDate} onChange={e => setContestForm({...contestForm, endDate: e.target.value})} className="w-full" required /></div>
                <div><label className="block text-[10px] text-tx-3 mb-1">투표 마감일</label><input type="date" value={contestForm.votingEnd} onChange={e => setContestForm({...contestForm, votingEnd: e.target.value})} className="w-full" /></div>
                <div><label className="block text-[10px] text-tx-3 mb-1">발표일</label><input type="date" value={contestForm.resultDate} onChange={e => setContestForm({...contestForm, resultDate: e.target.value})} className="w-full" /></div>
              </div>
              <textarea value={contestForm.prizes} onChange={e => setContestForm({...contestForm, prizes: e.target.value})} className="w-full h-16 resize-none" placeholder="시상 정보 (마크다운)" />
              <textarea value={contestForm.rules} onChange={e => setContestForm({...contestForm, rules: e.target.value})} className="w-full h-16 resize-none" placeholder="출품 가이드 + 심사 기준 (마크다운)" />
              <select value={contestForm.status} onChange={e => setContestForm({...contestForm, status: e.target.value})} className="w-full">
                {['UPCOMING', 'ACTIVE', 'VOTING', 'ENDED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" disabled={contestBusy} className="px-4 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                  {contestBusy ? '저장 중...' : selectedContest ? '수정' : '생성'}
                </button>
                {selectedContest && <button type="button" onClick={() => { setSelectedContest(null); setContestForm({ title: '', description: '', bannerText: '', startDate: '', endDate: '', votingEnd: '', resultDate: '', prizes: '', rules: '', status: 'UPCOMING' }); }} className="px-4 py-2 text-xs text-tx-3">취소</button>}
              </div>
            </form>
          </div>

          {/* Contest list */}
          <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-x-auto">
            {contests.length === 0 ? (
              <div className="text-center py-8 text-tx-3 text-xs">
                <button onClick={loadContests} className="text-acc hover:underline">콘테스트 목록 불러오기</button>
              </div>
            ) : (
              <table className="w-full text-xs min-w-[500px]">
                <thead><tr className="bg-bg-2 text-tx-3 text-[10px]">
                  <th className="text-left px-4 py-2.5">Title</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Entries</th>
                  <th className="text-right px-4 py-2.5">Actions</th>
                </tr></thead>
                <tbody>{contests.map(c => (
                  <>
                    <tr key={c.id} className="border-t border-bg-2 hover:bg-bg-2">
                      <td className="px-4 py-2.5 font-semibold">{c.title}</td>
                      <td className="px-4 py-2.5"><span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${c.status === 'ACTIVE' ? 'bg-acc-2/10 text-acc-2' : c.status === 'VOTING' ? 'bg-acc/10 text-acc' : c.status === 'ENDED' ? 'bg-bg-3 text-tx-3' : 'bg-acc-5/10 text-acc-5'}`}>{c.status}</span></td>
                      <td className="px-4 py-2.5 text-tx-3">{c._count?.entries || 0}</td>
                      <td className="px-4 py-2.5 text-right space-x-1">
                        {c.status === 'UPCOMING' && <button onClick={() => setContestStatus(c.id, 'ACTIVE')} className="text-[10px] px-2 py-0.5 rounded bg-acc-2/10 text-acc-2 hover:bg-acc-2/20">접수 시작</button>}
                        {c.status === 'ACTIVE' && <button onClick={() => setContestStatus(c.id, 'VOTING')} className="text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc hover:bg-acc/20">투표 시작</button>}
                        {c.status === 'VOTING' && <button onClick={() => setContestStatus(c.id, 'ENDED')} className="text-[10px] px-2 py-0.5 rounded bg-bg-3 text-tx-2 hover:bg-bg-4">종료</button>}
                        <button onClick={() => { setSelectedContest(c.id); setContestForm({ title: c.title, description: c.description, bannerText: c.bannerText || '', startDate: c.startDate?.slice(0,10) || '', endDate: c.endDate?.slice(0,10) || '', votingEnd: c.votingEnd?.slice(0,10) || '', resultDate: c.resultDate?.slice(0,10) || '', prizes: c.prizes || '', rules: c.rules || '', status: c.status }); }} className="text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc hover:bg-acc/20">Edit</button>
                        <button onClick={() => { setExpandedContest(expandedContest === c.id ? null : c.id); if (expandedContest !== c.id) loadContestEntries(c.id); }} className="text-[10px] px-2 py-0.5 rounded bg-bg-3 text-tx-2 hover:bg-bg-4">출품작</button>
                      </td>
                    </tr>
                    {expandedContest === c.id && (
                      <tr key={`${c.id}-entries`} className="border-t border-bg-2 bg-bg-0">
                        <td colSpan={4} className="px-4 py-3">
                          {entriesLoading ? (
                            <div className="text-xs text-tx-3">불러오는 중...</div>
                          ) : contestEntries.length === 0 ? (
                            <div className="text-xs text-tx-3">출품작 없음</div>
                          ) : (
                            <div className="space-y-1.5">
                              {contestEntries.map((entry, idx) => (
                                <div key={entry.id} className="flex items-center gap-3 text-xs bg-bg-1 rounded-lg px-3 py-2">
                                  <span className="text-tx-3 w-4">{idx + 1}</span>
                                  <span className="font-semibold flex-1 truncate">{entry.title}</span>
                                  <span className="text-tx-3">{entry.user?.name}</span>
                                  <span className="text-tx-3">♥ {entry._count?.votes || 0}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${entry.status === 'WINNER_1' ? 'bg-yellow-500/20 text-yellow-400' : entry.status === 'WINNER_2' ? 'bg-gray-400/20 text-gray-300' : entry.status === 'WINNER_3' ? 'bg-orange-500/20 text-orange-400' : 'bg-bg-3 text-tx-3'}`}>
                                    {entry.status === 'WINNER_1' ? '🥇 1위' : entry.status === 'WINNER_2' ? '🥈 2위' : entry.status === 'WINNER_3' ? '🥉 3위' : entry.status}
                                  </span>
                                  <div className="flex gap-1">
                                    {['WINNER_1','WINNER_2','WINNER_3'].map(w => (
                                      <button key={w} onClick={() => setWinner(c.id, entry.id, entry.status === w ? 'APPROVED' : w)}
                                        className={`text-[9px] px-1.5 py-0.5 rounded ${entry.status === w ? 'bg-acc text-bg-0' : 'bg-bg-3 text-tx-3 hover:bg-bg-4'}`}>
                                        {w === 'WINNER_1' ? '🥇' : w === 'WINNER_2' ? '🥈' : '🥉'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
