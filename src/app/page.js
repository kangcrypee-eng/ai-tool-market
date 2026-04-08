'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import ToolCard from '@/components/ToolCard';
import PostCard from '@/components/PostCard';
import Badge from '@/components/Badge';
import ShareButton from '@/components/ShareButton';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const TOOL_CATS = [{ k: 'all', l: '전체' }, { k: 'automation', l: '자동화' }, { k: 'content', l: '콘텐츠' }, { k: 'data', l: '데이터' }, { k: 'marketing', l: '마케팅' }, { k: 'productivity', l: '생산성' }];
const POST_CATS = [{ k: 'all', l: 'All' }, { k: 'TOOL_SHARE', l: 'Tools' }, { k: 'TIP', l: 'Tips' }, { k: 'QUESTION', l: 'Q&A' }, { k: 'REVIEW', l: 'Reviews' }];

export default function HomePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState('community');
  const [tools, setTools] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toolCat, setToolCat] = useState('all');
  const [postCat, setPostCat] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [toolSort, setToolSort] = useState('latest');
  const [visibleCount, setVisibleCount] = useState(20);

  // Contest
  const [contest, setContest] = useState(null);
  const [contestEntries, setContestEntries] = useState([]);
  const [contestLoading, setContestLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryForm, setEntryForm] = useState({ title: '', description: '', videoUrl: '', tryUrl: '', images: '' });
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);

  // Composer
  const [showComposer, setShowComposer] = useState(false);
  const [postForm, setPostForm] = useState({ type: 'TIP', title: '', body: '', tags: '' });
  const [postImages, setPostImages] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [posting, setPosting] = useState(false);

  // Tool upload
  const [showToolForm, setShowToolForm] = useState(false);
  const [toolForm, setToolForm] = useState({ name: '', description: '', longDescription: '', category: 'general', toolUrl: '', toolContent: '', oneTimePrice: '', freeTrialDays: '30' });
  const [postingTool, setPostingTool] = useState(false);

  const loadPosts = () => {
    const p = new URLSearchParams();
    if (postCat !== 'all') p.set('type', postCat);
    if (search) p.set('search', search);
    return fetch(`/api/posts?${p}`, { next: { revalidate: 30 } }).then(r => r.json()).then(d => setPosts(d.posts || []));
  };
  const loadTools = () => {
    const p = new URLSearchParams();
    if (toolCat !== 'all') p.set('category', toolCat);
    if (search) p.set('search', search);
    if (toolSort !== 'latest') p.set('sort', toolSort);
    return fetch(`/api/tools?${p}`, { next: { revalidate: 30 } }).then(r => r.json()).then(d => setTools(d.tools || []));
  };
  const loadContest = async () => {
    if (contest) { setContestLoading(false); return; } // cache
    setContestLoading(true);
    try {
      const r = await fetch('/api/contests');
      const d = await r.json();
      const active = (d.contests || []).find(c => ['ACTIVE', 'VOTING', 'UPCOMING'].includes(c.status));
      const ended = (d.contests || []).find(c => c.status === 'ENDED');
      const target = active || ended;
      if (target) {
        const dr = await fetch(`/api/contests/${target.id}`);
        const dd = await dr.json();
        setContest(dd.contest);
        setContestEntries(dd.contest?.entries || []);
      } else {
        setContest(null);
        setContestEntries([]);
      }
    } catch {
      setLoadError('콘테스트 정보를 불러오지 못했습니다.');
    } finally { setContestLoading(false); }
  };

  useEffect(() => {
    setLoadError(null);
    if (mode === 'contest') {
      if (!contest) { setLoading(true); loadContest().finally(() => setLoading(false)); }
      else setLoading(false);
    } else if (mode === 'market') {
      setLoading(true);
      loadTools().catch(() => setLoadError('툴 목록을 불러오지 못했습니다.')).finally(() => setLoading(false));
    } else {
      setLoading(true);
      loadPosts().catch(() => setLoadError('게시글을 불러오지 못했습니다.')).finally(() => setLoading(false));
    }
  }, [mode, toolCat, postCat, search, toolSort]);

  // Prefetch other tabs in background
  useEffect(() => {
    if (posts.length === 0) loadPosts().catch(() => {});
  }, []);

  const handleLike = async (postId) => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const wasLiked = p.likes?.length > 0;
      return {
        ...p,
        likes: wasLiked ? [] : [{ id: 'temp' }],
        _count: { ...p._count, likes: (p._count?.likes || 0) + (wasLiked ? -1 : 1) },
      };
    }));
    try {
      const r = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!r.ok) throw new Error('좋아요 실패');
    } catch (e) {
      loadPosts(); // Revert on error
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') return (b._count?.likes || 0) - (a._count?.likes || 0);
    if (sortBy === 'comments') return (b._count?.comments || 0) - (a._count?.comments || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/posts/images', { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPostImages(prev => [...prev, d.url]);
    } catch (e) { alert(e.message); }
    finally { setUploadingImg(false); e.target.value = ''; }
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.title || !entryForm.description) return;
    setSubmittingEntry(true);
    try {
      const images = entryForm.images.split(',').map(s => s.trim()).filter(Boolean);
      const r = await fetch(`/api/contests/${contest.id}/entries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entryForm, images }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setEntryForm({ title: '', description: '', videoUrl: '', tryUrl: '', images: '' });
      setShowEntryForm(false);
      loadContest();
    } catch (e) { alert(e.message); }
    finally { setSubmittingEntry(false); }
  };

  const deleteEntry = async (entryId) => {
    if (!confirm('출품작을 삭제하시겠습니까?')) return;
    try {
      const r = await fetch(`/api/contests/entries/${entryId}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setContestEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (e) { alert(e.message); }
  };

  const likeEntry = async (entryId) => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    setContestEntries(prev => prev.map(e => e.id === entryId ? { ...e, _count: { ...e._count, votes: (e._count?.votes || 0) + 1 }, _liked: true } : e));
    try {
      await fetch(`/api/contests/entries/${entryId}/like`, { method: 'POST' });
    } catch {}
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.body) return;
    setPosting(true);
    try {
      const tags = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const r = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...postForm, tags, images: postImages }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPostForm({ type: 'TIP', title: '', body: '', tags: '' });
      setPostImages([]);
      setShowComposer(false);
      loadPosts();
    } catch (e) { alert(e.message); }
    finally { setPosting(false); }
  };

  const submitTool = async (e) => {
    e.preventDefault();
    if (!toolForm.name || !toolForm.description) return;
    setPostingTool(true);
    try {
      const r = await fetch('/api/tools', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toolForm, oneTimePrice: toolForm.oneTimePrice ? parseInt(toolForm.oneTimePrice, 10) : null, freeTrialDays: parseInt(toolForm.freeTrialDays, 10) || 30 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setToolForm({ name: '', description: '', longDescription: '', category: 'general', toolUrl: '', toolContent: '', oneTimePrice: '', freeTrialDays: '30' });
      setShowToolForm(false);
      alert('툴이 등록되었습니다! 마켓에서 확인해보세요.');
      loadTools();
    } catch (e) { alert(e.message); }
    finally { setPostingTool(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Mode switch */}
      <div className="flex bg-bg-1 border border-bg-3 rounded-lg p-1 mb-4 max-w-xs mx-auto">
        {[['community', '💬 Community'], ['market', '🛒 Market'], ['contest', '🏆 Contest']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${mode === m ? 'bg-bg-3 text-tx-0' : 'text-tx-3 hover:text-tx-1'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Notice banner */}
      {mode !== 'contest' && (
        <div className="bg-gradient-to-r from-acc-2/[0.06] to-acc/[0.06] border border-acc-2/15 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-acc-5 flex-shrink-0 animate-pulse" />
          <span className="text-xs text-tx-1">{process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true' ? '⚡ 모든 신규 툴은 등록 후 30일간 무료 체험 가능합니다' : '⚡ 현재 모든 툴은 무료로 이용 가능합니다'}</span>
        </div>
      )}

      {/* Search */}
      {mode !== 'contest' && <div className="relative mb-4 max-w-lg mx-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-3 text-sm">🔍</span>
        <input placeholder={mode === 'community' ? '게시글 검색...' : '툴 검색...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5" />
      </div>}

      {/* Categories */}
      {mode !== 'contest' && <div className="flex gap-1 flex-wrap mb-5 justify-center">
        {(mode === 'market' ? TOOL_CATS : POST_CATS).map(c => (
          <button key={c.k}
            onClick={() => mode === 'market' ? setToolCat(c.k) : setPostCat(c.k)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              (mode === 'market' ? toolCat : postCat) === c.k
                ? 'bg-acc border-acc text-bg-0 font-semibold'
                : 'border-bg-3 text-tx-2 hover:border-tx-3 hover:text-tx-1'
            }`}>
            {c.l}
          </button>
        ))}
      </div>}

      {/* ===== COMMUNITY MODE ===== */}
      {mode === 'community' && (
        <div className="max-w-2xl mx-auto">
          {/* Composer trigger / form */}
          {user ? (
            showComposer ? (
              <div className="bg-bg-1 border border-acc/30 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-0.5 h-3.5 bg-acc rounded" />새 글 작성
                  </h3>
                  <button onClick={() => setShowComposer(false)} className="text-xs text-tx-3 hover:text-tx-1 px-2 py-1 rounded hover:bg-bg-3">✕</button>
                </div>
                <form onSubmit={submitPost} className="space-y-3">
                  <div className="flex gap-1 flex-wrap">
                    {[['TIP', '💡 Tip'], ['QUESTION', '❓ Q&A'], ['REVIEW', '⭐ Review'], ['TOOL_SHARE', '🔧 Tool']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setPostForm({ ...postForm, type: v })}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${postForm.type === v ? 'bg-acc text-bg-0' : 'bg-bg-2 text-tx-3 hover:text-tx-1'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full" placeholder="제목을 입력하세요" required />
                  <textarea value={postForm.body} onChange={e => setPostForm({ ...postForm, body: e.target.value })}
                    className="w-full h-32 resize-none" placeholder="내용을 작성하세요..." required />
                  <input value={postForm.tags} onChange={e => setPostForm({ ...postForm, tags: e.target.value })}
                    className="w-full" placeholder="태그 (쉼표로 구분: AI, 자동화, 팁)" />
                  {/* Image upload */}
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-2 text-tx-3 text-[11px] hover:text-tx-1 cursor-pointer transition-colors">
                      📷 {uploadingImg ? '업로드 중...' : '이미지 첨부'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
                    </label>
                    {postImages.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {postImages.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-bg-3">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setPostImages(prev => prev.filter((_, j) => j !== i))}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-bg-0/80 text-[9px] text-tx-1 flex items-center justify-center">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowComposer(false)} className="px-4 py-2 rounded-lg text-xs text-tx-3 hover:text-tx-1 hover:bg-bg-2">취소</button>
                    <button type="submit" disabled={posting}
                      className="px-5 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                      {posting ? '게시 중...' : '게시하기'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => setShowComposer(true)}
                className="w-full bg-bg-1 border border-bg-3 rounded-xl p-3.5 mb-5 flex items-center gap-3 hover:border-acc/30 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-bg-3 flex items-center justify-center text-xs font-bold text-acc">{user.name?.[0]}</div>
                <span className="text-xs text-tx-3 group-hover:text-tx-2">새로운 글을 작성해보세요...</span>
                <span className="ml-auto text-[10px] text-tx-3 border border-bg-3 rounded-md px-2 py-1 group-hover:border-acc/30 group-hover:text-acc">글쓰기</span>
              </button>
            )
          ) : (
            <div className="bg-bg-1 border border-bg-3 rounded-xl p-4 mb-5 text-center">
              <span className="text-xs text-tx-3">글을 작성하려면 </span>
              <a href="/login" className="text-xs text-acc hover:underline">로그인</a>
              <span className="text-xs text-tx-3">이 필요합니다</span>
            </div>
          )}

          {/* Sort controls */}
          <div className="flex items-center gap-2 mb-3">
            {[['latest', '최신순'], ['popular', '인기순'], ['comments', '댓글순']].map(([k, l]) => (
              <button key={k} onClick={() => setSortBy(k)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${sortBy === k ? 'bg-bg-3 text-tx-0 font-semibold' : 'text-tx-3 hover:text-tx-1'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-bg-1 border border-bg-3 rounded-xl animate-pulse h-36" />)}</div>
          ) : loadError ? (
            <div className="text-center py-16 text-tx-3">
              <p className="text-sm mb-3">{loadError}</p>
              <button onClick={() => { setLoadError(null); loadPosts(); }} className="text-xs text-acc hover:underline">다시 시도</button>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-16 text-tx-3">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">아직 게시글이 없습니다</p>
              <p className="text-xs mt-1 text-tx-3">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">{sortedPosts.slice(0, visibleCount).map(p => <PostCard key={p.id} post={p} onLike={handleLike} onDelete={(id) => setPosts(posts.filter(x => x.id !== id))} onTagClick={(tag) => setSearch(tag)} />)}</div>
              {sortedPosts.length > visibleCount && (
                <button onClick={() => setVisibleCount(v => v + 20)} className="w-full mt-4 py-3 rounded-lg bg-bg-1 border border-bg-3 text-xs text-tx-2 hover:bg-bg-2 transition-colors">
                  더 보기 ({sortedPosts.length - visibleCount}개 남음)
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== MARKET MODE ===== */}
      {mode === 'market' && (
        <div>
          {/* Sort controls */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[['latest', '🕐 최신순'], ['popular', '🔥 인기순']].map(([k, l]) => (
              <button key={k} onClick={() => setToolSort(k)}
                className={`text-[11px] px-3 py-1.5 rounded-md transition-colors ${toolSort === k ? 'bg-bg-3 text-tx-0 font-semibold' : 'text-tx-3 hover:text-tx-1'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Tool upload trigger / form */}
          {user ? (
            showToolForm ? (
              <div className="bg-bg-1 border border-acc/30 rounded-xl p-4 mb-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-0.5 h-3.5 bg-acc-2 rounded" />새 툴 등록
                  </h3>
                  <button onClick={() => setShowToolForm(false)} className="text-xs text-tx-3 hover:text-tx-1 px-2 py-1 rounded hover:bg-bg-3">✕</button>
                </div>
                <form onSubmit={submitTool} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-tx-2 mb-1">이름 *</label><input value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} className="w-full" placeholder="AI 블로그 작성기" required /></div>
                    <div><label className="block text-xs text-tx-2 mb-1">카테고리</label>
                      <select value={toolForm.category} onChange={e => setToolForm({...toolForm, category: e.target.value})} className="w-full">
                        {['general','automation','content','data','marketing','productivity'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="block text-xs text-tx-2 mb-1">짧은 설명 *</label><input value={toolForm.description} onChange={e => setToolForm({...toolForm, description: e.target.value})} className="w-full" placeholder="이 툴이 어떤 일을 하는지 한 줄로 설명해주세요" required /></div>
                  <div><label className="block text-xs text-tx-2 mb-1">상세 설명 (공개 — 미결제자도 볼 수 있음)</label><textarea value={toolForm.longDescription} onChange={e => setToolForm({...toolForm, longDescription: e.target.value})} className="w-full h-20 resize-none" placeholder="기능, 사용법, 특징 등을 자세히 설명해주세요" /></div>
                  <div><label className="block text-xs text-tx-2 mb-1">📝 텍스트 콘텐츠 (결제 후 공개 — 프롬프트, 사용 가이드 등)</label><textarea value={toolForm.toolContent} onChange={e => setToolForm({...toolForm, toolContent: e.target.value})} className="w-full h-32 resize-none" placeholder="프롬프트 원문, 상세 사용법, 세팅 가이드, 업데이트 노트 등&#10;마크다운 형식으로 작성 가능합니다" /><p className="text-[10px] text-tx-3 mt-1">이 콘텐츠는 무료 체험 기간 또는 결제 후에만 볼 수 있습니다</p></div>
                  <div>
                    <label className="block text-xs text-tx-2 mb-1">툴 링크 (선택)</label>
                    <input value={toolForm.toolUrl} onChange={e => setToolForm({...toolForm, toolUrl: e.target.value})} className="w-full" placeholder="https://notion.so/my-tool 또는 https://my-app.com" />
                    <p className="text-[10px] text-tx-3 mt-1">노션, 구글 시트, 웹앱 URL 등. 파일은 등록 후 My 페이지에서 업로드할 수 있습니다.</p>
                  </div>
                  {process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true' && (
                    <>
                      <div>
                        <label className="block text-xs text-tx-2 mb-1">무료 체험 기간 (일)</label>
                        <input type="number" value={toolForm.freeTrialDays} onChange={e => setToolForm({...toolForm, freeTrialDays: e.target.value})} className="w-full" min="0" placeholder="30" />
                      </div>
                      <div className="border-t border-bg-3 pt-3">
                        <div className="text-xs font-semibold text-tx-2 mb-2">가격 설정</div>
                        <input type="number" value={toolForm.oneTimePrice} onChange={e => setToolForm({...toolForm, oneTimePrice: e.target.value})} className="w-full" placeholder="가격 (₩) — 비워두면 무료" min="0" />
                        <p className="text-[10px] text-tx-3 mt-2">💡 무료 체험 후 설정한 가격으로 유료 전환됩니다. 비워두면 무료 툴로 등록됩니다.</p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowToolForm(false)} className="px-4 py-2 rounded-lg text-xs text-tx-3 hover:text-tx-1 hover:bg-bg-2">취소</button>
                    <button type="submit" disabled={postingTool}
                      className="px-5 py-2 rounded-lg bg-acc-2 text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                      {postingTool ? '등록 중...' : '등록하기'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => setShowToolForm(true)}
                className="w-full max-w-2xl mx-auto bg-bg-1 border border-bg-3 rounded-xl p-3.5 mb-5 flex items-center gap-3 hover:border-acc-2/30 transition-colors text-left group block">
                <div className="w-8 h-8 rounded-lg bg-bg-3 flex items-center justify-center text-xs font-bold text-acc-2">+</div>
                <span className="text-xs text-tx-3 group-hover:text-tx-2">새로운 AI 툴을 등록해보세요...</span>
                <span className="ml-auto text-[10px] text-tx-3 border border-bg-3 rounded-md px-2 py-1 group-hover:border-acc-2/30 group-hover:text-acc-2">툴 등록</span>
              </button>
            )
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-bg-1 border border-bg-3 rounded-xl overflow-hidden animate-pulse h-40" />)}
            </div>
          ) : loadError ? (
            <div className="text-center py-16 text-tx-3">
              <p className="text-sm mb-3">{loadError}</p>
              <button onClick={() => { setLoadError(null); loadTools(); }} className="text-xs text-acc hover:underline">다시 시도</button>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-16 text-tx-3"><div className="text-3xl mb-2">🔍</div><p className="text-sm">등록된 툴이 없습니다</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{tools.map(t => <ToolCard key={t.id} tool={t} />)}</div>
          )}
        </div>
      )}

      {/* ===== CONTEST MODE ===== */}
      {mode === 'contest' && (
        <div className="max-w-3xl mx-auto">
          {contestLoading ? (
            <div className="space-y-4"><div className="h-48 bg-bg-2 rounded-xl animate-pulse" /><div className="h-32 bg-bg-2 rounded-xl animate-pulse" /></div>
          ) : loadError ? (
            <div className="text-center py-16 text-tx-3">
              <p className="text-sm mb-3">{loadError}</p>
              <button onClick={() => { setLoadError(null); setContest(null); loadContest(); }} className="text-xs text-acc hover:underline">다시 시도</button>
            </div>
          ) : !contest ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🏆</div>
              <h2 className="text-lg font-semibold mb-2">Contest</h2>
              <p className="text-sm text-tx-3 mb-1">아직 진행 중인 콘테스트가 없습니다</p>
              <p className="text-xs text-tx-3">곧 새로운 챌린지가 열릴 예정입니다</p>
              <p className="text-xs text-tx-3 mt-4">📢 소식을 놓치지 마세요!</p>
            </div>
          ) : (
            <>
              {/* Hero banner (all info inside) */}
              <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0e0e1a] border border-acc-5/20 rounded-2xl p-6 sm:p-8 mb-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,220,170,0.06),transparent_70%)]" />
                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl font-bold text-acc-5 mb-2">{contest.title}</div>
                  {contest.bannerText && <p className="text-sm text-tx-2 mb-5">{contest.bannerText}</p>}

                  {/* Timeline inside banner */}
                  <div className="flex items-center justify-center gap-6 mb-5 text-[11px]">
                    {[
                      { label: '접수', date: contest.startDate && contest.endDate ? `${new Date(contest.startDate).toLocaleDateString('ko-KR', {month:'2-digit',day:'2-digit'})}~${new Date(contest.endDate).toLocaleDateString('ko-KR', {month:'2-digit',day:'2-digit'})}` : '', active: contest.status === 'ACTIVE' },
                      { label: '투표', date: contest.votingEnd ? `~${new Date(contest.votingEnd).toLocaleDateString('ko-KR', {month:'2-digit',day:'2-digit'})}` : '', active: contest.status === 'VOTING' },
                      { label: '발표', date: contest.resultDate ? new Date(contest.resultDate).toLocaleDateString('ko-KR', {month:'2-digit',day:'2-digit'}) : '', active: contest.status === 'ENDED' },
                    ].map((s, i) => (
                      <div key={i} className={`text-center ${s.active ? 'text-acc font-semibold' : 'text-tx-3'}`}>
                        <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.active ? 'bg-acc animate-pulse' : 'bg-bg-4'}`} />
                        <div>{s.label}{s.active && ' ·'}</div>
                        <div className="text-[10px]">{s.date}</div>
                      </div>
                    ))}
                  </div>

                  {/* Prizes inside banner */}
                  {contest.prizes && (
                    <div className="text-xs text-tx-2 leading-relaxed whitespace-pre-line mb-5 bg-white/[0.03] rounded-xl p-4 inline-block text-left">{contest.prizes}</div>
                  )}

                  {/* Actions inside banner */}
                  {contest.status === 'ACTIVE' && (
                    <div className="flex gap-2 justify-center">
                      {contest.rules && (
                        <button onClick={() => setExpandedEntry(expandedEntry === 'rules' ? null : 'rules')}
                          className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-tx-2 hover:bg-white/10">출품 가이드</button>
                      )}
                      {user && (
                        <button onClick={() => { setShowEntryForm(!showEntryForm); setTimeout(() => document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                          className="px-4 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">출품하기</button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Rules expandable */}
              {expandedEntry === 'rules' && contest.rules && (
                <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-6 text-xs text-tx-2 leading-relaxed whitespace-pre-line">{contest.rules}</div>
              )}

              {/* Entry form */}
              {showEntryForm && contest.status === 'ACTIVE' && user && (
                <div id="entry-form" className="bg-bg-1 border border-acc/30 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold mb-3">출품하기</h3>
                  <form onSubmit={submitEntry} className="space-y-3">
                    <input value={entryForm.title} onChange={e => setEntryForm({...entryForm, title: e.target.value})} className="w-full" placeholder="제목 *" required />
                    <textarea value={entryForm.description} onChange={e => setEntryForm({...entryForm, description: e.target.value})} className="w-full h-32 resize-none" placeholder="설명 * (마크다운 가능)" required />
                    <input value={entryForm.videoUrl} onChange={e => setEntryForm({...entryForm, videoUrl: e.target.value})} className="w-full" placeholder="데모 영상 URL (YouTube) — 카드에 임베드로 표시됨" />
                    <input value={entryForm.tryUrl} onChange={e => setEntryForm({...entryForm, tryUrl: e.target.value})} className="w-full" placeholder="사용해보기 URL — 유저가 직접 써볼 수 있는 링크" />
                    <input value={entryForm.images} onChange={e => setEntryForm({...entryForm, images: e.target.value})} className="w-full" placeholder="스크린샷 URL (쉼표로 구분, 선택)" />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowEntryForm(false)} className="px-4 py-2 text-xs text-tx-3 hover:text-tx-1">취소</button>
                      <button type="submit" disabled={submittingEntry} className="px-5 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
                        {submittingEntry ? '출품 중...' : '출품하기'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Entries */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">출품작 ({contestEntries.length})</h3>
                <span className="text-[10px] text-tx-3">추천순</span>
              </div>

              {contestEntries.length === 0 ? (
                <div className="text-center py-12 text-tx-3 text-xs">아직 출품작이 없습니다</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {contestEntries.map((entry, idx) => {
                    const isWinner = entry.status?.startsWith('WINNER');
                    const medal = entry.status === 'WINNER_1' ? '🥇' : entry.status === 'WINNER_2' ? '🥈' : entry.status === 'WINNER_3' ? '🥉' : null;
                    const embedUrl = getYouTubeEmbedUrl(entry.videoUrl);
                    return (
                      <div key={entry.id} className={`bg-bg-1 border rounded-xl overflow-hidden transition-colors ${isWinner ? 'border-acc-5/30' : 'border-bg-3 hover:border-bg-4'}`}>
                        {/* Thumbnail: video or screenshot */}
                        {embedUrl ? (
                          <iframe src={embedUrl} className="w-full aspect-video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                        ) : entry.images?.length > 0 ? (
                          <img src={entry.images[0]} alt="" className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-bg-2 flex items-center justify-center text-2xl">{medal || '🏆'}</div>
                        )}
                        <div className="p-3">
                          {/* Title + medal */}
                          <div className="flex items-center gap-1.5 mb-1">
                            {medal && <span className="text-sm">{medal}</span>}
                            <h4 className="text-xs font-semibold line-clamp-1 hover:text-acc cursor-pointer" onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}>{entry.title}</h4>
                          </div>
                          {/* Author */}
                          <div className="flex items-center gap-1 flex-wrap mb-1.5">
                            <span className="text-[10px] text-tx-3">{entry.user?.name}</span>
                            {entry.user?.badges?.slice(0, 2).map(b => <Badge key={b} code={b} />)}
                            {user && (entry.user?.id === user.id || user.role === 'ADMIN') && (
                              <button onClick={() => deleteEntry(entry.id)} className="text-[9px] text-red-400 hover:underline">삭제</button>
                            )}
                          </div>
                          <p className="text-[10px] text-tx-2 line-clamp-2 mb-2">{entry.description}</p>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            {entry.tryUrl && /^https?:\/\//i.test(entry.tryUrl) && (
                              <a href={entry.tryUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-full bg-acc/10 text-acc text-[10px] font-semibold hover:bg-acc/20">🔗</a>
                            )}
                            <button onClick={() => likeEntry(entry.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${entry._liked ? 'bg-red-500/10 text-red-400' : 'bg-bg-2 text-tx-3 hover:bg-red-500/10 hover:text-red-400'}`}>
                              {entry._liked ? '♥' : '♡'} {entry._count?.votes || 0}
                            </button>
                            <ShareButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/contest/${contest.id}/entry/${entry.id}`} title={entry.title} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lucky draw */}
              {contest.luckyDrawEnabled && (
                <div className="bg-bg-1 border border-acc-5/20 rounded-xl p-5 mt-6">
                  {contest.luckyDrawWinners?.length > 0 ? (
                    <>
                      <h3 className="text-sm font-semibold mb-3">🎲 럭키드로우 당첨자</h3>
                      <p className="text-xs text-tx-2 mb-2">{contest.luckyDrawPrize}</p>
                      <div className="flex flex-wrap gap-2">
                        {contest.luckyDrawWinners.map((id, i) => (
                          <span key={i} className="text-[11px] px-2 py-1 rounded bg-acc-5/10 text-acc-5">{id.slice(0, 3)}***</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold mb-2">🎲 투표하고 경품 받자!</h3>
                      {contest.luckyDrawPrize && <p className="text-xs text-tx-2 mb-2">{contest.luckyDrawPrize}</p>}
                      <p className="text-[11px] text-tx-3">출품작에 투표하면 자동 응모됩니다. 추첨으로 {contest.luckyDrawCount}명에게 경품을 드립니다.</p>
                    </>
                  )}
                </div>
              )}

              {/* Ended contest results */}
              {contest.status === 'ENDED' && contestEntries.some(e => e.status?.startsWith('WINNER')) && (
                <div className="mt-6 pt-6 border-t border-bg-3">
                  <p className="text-xs text-tx-3 text-center">📢 다음 콘테스트를 준비 중입니다</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
