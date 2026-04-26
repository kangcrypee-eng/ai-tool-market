'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const typeStyles = {
  TOOL_SHARE: { label: 'Tool', cls: 'bg-acc/10 text-acc' },
  TIP: { label: 'Tip', cls: 'bg-acc-5/10 text-acc-5' },
  QUESTION: { label: 'Q&A', cls: 'bg-acc-4/10 text-acc-4' },
  REVIEW: { label: 'Review', cls: 'bg-acc-2/10 text-acc-2' },
};

function getTimeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PostDetailClient({ initialPost }) {
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const postId = post?.id;
  const load = () => fetch(`/api/posts/${postId}`).then(r => r.json()).then(d => setPost(d.post)).catch(() => {});

  const liked = post?.likes?.length > 0;

  const handleLike = async () => {
    if (!user) return router.push('/login');
    setPost(prev => ({
      ...prev,
      likes: liked ? [] : [{ id: 'temp' }],
      _count: { ...prev._count, likes: (prev._count?.likes || 0) + (liked ? -1 : 1) },
    }));
    try {
      const r = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!r.ok) load();
    } catch { load(); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const r = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setCommentText('');
      load();
    } catch (e) { alert(e.message); }
    finally { setPosting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const r = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      const r = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      router.push('/');
    } catch (e) { alert(e.message); }
  };

  if (!post) return <div className="text-center py-20 text-tx-3">게시글을 찾을 수 없습니다</div>;

  const style = typeStyles[post.type] || typeStyles.TIP;
  const canDelete = user && (post.authorId === user.id || post.author?.id === user.id || user.role === 'ADMIN');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-6 inline-flex items-center gap-1">← Back to feed</Link>

      <div className="bg-bg-1 border border-bg-3 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-bg-3 flex items-center justify-center text-sm font-bold text-tx-1">{post.author?.name?.[0]}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-tx-0">{post.author?.name}</div>
            <div className="text-[11px] text-tx-3">{getTimeAgo(post.createdAt)}</div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded font-semibold ${style.cls}`}>{style.label}</span>
          {canDelete && (
            <button onClick={handleDeletePost} className="text-[11px] text-red-400 hover:underline">삭제</button>
          )}
        </div>

        <h1 className="text-lg font-semibold mb-3">{post.title}</h1>
        <p className="text-sm text-tx-2 leading-relaxed whitespace-pre-line">{post.body}</p>

        {post.tool && (
          <Link href={`/tool/${post.tool.id}`} className="block bg-bg-2 border border-bg-3 rounded-lg p-3 mt-4 hover:border-bg-4 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm">🤖</span>
              <div><h4 className="text-xs font-semibold">{post.tool.name}</h4><p className="text-[10px] text-tx-3">{post.tool.category}</p></div>
            </div>
          </Link>
        )}

        {post.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-4">
            {post.tags.map(t => <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-bg-2 text-tx-2">#{t}</span>)}
          </div>
        )}

        <div className="flex gap-5 pt-4 mt-4 border-t border-bg-2">
          <button onClick={handleLike} className={`text-xs flex items-center gap-1.5 transition-colors ${liked ? 'text-red-400' : 'text-tx-3 hover:text-tx-1'}`}>
            {liked ? '♥' : '♡'} {post._count?.likes || 0} likes
          </button>
          <span className="text-xs text-tx-3">💬 {post._count?.comments || 0} comments</span>
        </div>
      </div>

      <div className="bg-bg-1 border border-bg-3 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">댓글 {post._count?.comments || 0}</h2>

        {user ? (
          <form onSubmit={submitComment} className="flex gap-2 mb-5 pb-5 border-b border-bg-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 text-xs" placeholder="댓글을 작성하세요..." required />
            <button type="submit" disabled={posting} className="px-4 py-2 rounded-lg bg-acc text-bg-0 text-[11px] font-semibold hover:brightness-110 disabled:opacity-50 flex-shrink-0">
              {posting ? '...' : '등록'}
            </button>
          </form>
        ) : (
          <p className="text-[11px] text-tx-3 mb-5 pb-5 border-b border-bg-2">
            댓글을 작성하려면 <Link href="/login" className="text-acc hover:underline">로그인</Link>이 필요합니다
          </p>
        )}

        {post.comments?.length === 0 ? (
          <div className="text-[11px] text-tx-3 text-center py-6">아직 댓글이 없습니다</div>
        ) : (
          <div className="space-y-3">
            {post.comments.map(c => {
              const canDeleteC = user && (c.userId === user.id || c.user?.id === user.id || user.role === 'ADMIN');
              return (
                <div key={c.id} className="group flex gap-3">
                  <div className="w-7 h-7 rounded-md bg-bg-3 flex items-center justify-center text-[10px] font-bold text-tx-2 flex-shrink-0">{c.user?.name?.[0]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-tx-0">{c.user?.name}</span>
                      <span className="text-[10px] text-tx-3">{getTimeAgo(c.createdAt)}</span>
                      {canDeleteC && (
                        <button onClick={() => handleDeleteComment(c.id)} className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">삭제</button>
                      )}
                    </div>
                    <p className="text-xs text-tx-2 mt-1">{c.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
