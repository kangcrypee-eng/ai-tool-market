'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import ToolCard from '@/components/ToolCard';
import PostCard from '@/components/PostCard';

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

  // Composer
  const [showComposer, setShowComposer] = useState(false);
  const [postForm, setPostForm] = useState({ type: 'TIP', title: '', body: '', tags: '' });
  const [posting, setPosting] = useState(false);

  // Tool upload
  const [showToolForm, setShowToolForm] = useState(false);
  const [toolForm, setToolForm] = useState({ name: '', description: '', longDescription: '', category: 'general', toolUrl: '' });
  const [postingTool, setPostingTool] = useState(false);

  const loadPosts = () => {
    const p = new URLSearchParams();
    if (postCat !== 'all') p.set('type', postCat);
    if (search) p.set('search', search);
    return fetch(`/api/posts?${p}`).then(r => r.json()).then(d => setPosts(d.posts || []));
  };
  const loadTools = () => {
    const p = new URLSearchParams();
    if (toolCat !== 'all') p.set('category', toolCat);
    if (search) p.set('search', search);
    return fetch(`/api/tools?${p}`).then(r => r.json()).then(d => setTools(d.tools || []));
  };

  useEffect(() => {
    setLoading(true);
    (mode === 'market' ? loadTools() : loadPosts()).finally(() => setLoading(false));
  }, [mode, toolCat, postCat, search]);

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

  const submitPost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.body) return;
    setPosting(true);
    try {
      const tags = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const r = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...postForm, tags }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPostForm({ type: 'TIP', title: '', body: '', tags: '' });
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
        body: JSON.stringify(toolForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setToolForm({ name: '', description: '', longDescription: '', category: 'general', toolUrl: '' });
      setShowToolForm(false);
      alert('툴이 등록되었습니다! 관리자 승인 후 마켓에 공개됩니다.');
      loadTools();
    } catch (e) { alert(e.message); }
    finally { setPostingTool(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Mode switch */}
      <div className="flex bg-bg-1 border border-bg-3 rounded-lg p-1 mb-4 max-w-xs mx-auto">
        {[['community', '💬 Community'], ['market', '🛒 Market']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${mode === m ? 'bg-bg-3 text-tx-0' : 'text-tx-3 hover:text-tx-1'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Notice banner */}
      <div className="bg-gradient-to-r from-acc-2/[0.06] to-acc/[0.06] border border-acc-2/15 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-acc-5 flex-shrink-0 animate-pulse" />
        <span className="text-xs text-tx-1">🚧 crypee는 현재 베타 서비스입니다 · 결제 기능 준비 중이며, 모든 툴은 무료로 이용 가능합니다</span>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-lg mx-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-3 text-sm">🔍</span>
        <input placeholder={mode === 'community' ? '게시글 검색...' : '툴 검색...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5" />
      </div>

      {/* Categories */}
      <div className="flex gap-1 flex-wrap mb-5 justify-center">
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
      </div>

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

          {/* Feed */}
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-bg-1 border border-bg-3 rounded-xl animate-pulse h-36" />)}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-tx-3">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">아직 게시글이 없습니다</p>
              <p className="text-xs mt-1 text-tx-3">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">{posts.map(p => <PostCard key={p.id} post={p} onLike={handleLike} />)}</div>
          )}
        </div>
      )}

      {/* ===== MARKET MODE ===== */}
      {mode === 'market' && (
        <div>
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
                  <div><label className="block text-xs text-tx-2 mb-1">상세 설명</label><textarea value={toolForm.longDescription} onChange={e => setToolForm({...toolForm, longDescription: e.target.value})} className="w-full h-20 resize-none" placeholder="기능, 사용법, 특징 등을 자세히 설명해주세요" /></div>
                  <div>
                    <label className="block text-xs text-tx-2 mb-1">툴 링크 (노션, 구글독스, 웹앱 URL 등)</label>
                    <input value={toolForm.toolUrl} onChange={e => setToolForm({...toolForm, toolUrl: e.target.value})} className="w-full" placeholder="https://notion.so/my-tool 또는 https://my-app.com" />
                    <p className="text-[10px] text-tx-3 mt-1">실제 툴을 사용할 수 있는 링크를 입력하세요. 노션 페이지, 구글 시트, 웹앱 URL 등 어떤 형태든 가능합니다.</p>
                  </div>
                  <div className="bg-bg-2 border border-bg-3 rounded-lg p-3 text-xs text-tx-3">
                    💡 현재 모든 툴은 무료로 공개됩니다. 결제 기능은 추후 업데이트될 예정입니다.
                  </div>
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
          ) : tools.length === 0 ? (
            <div className="text-center py-16 text-tx-3"><div className="text-3xl mb-2">🔍</div><p className="text-sm">등록된 툴이 없습니다</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{tools.map(t => <ToolCard key={t.id} tool={t} />)}</div>
          )}
        </div>
      )}
    </div>
  );
}
