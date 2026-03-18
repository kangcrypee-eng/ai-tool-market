'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState } from 'react';

const typeStyles = {
  TOOL_SHARE: { label: 'Tool', cls: 'bg-acc/10 text-acc' },
  TIP: { label: 'Tip', cls: 'bg-acc-5/10 text-acc-5' },
  QUESTION: { label: 'Q&A', cls: 'bg-acc-4/10 text-acc-4' },
  REVIEW: { label: 'Review', cls: 'bg-acc-2/10 text-acc-2' },
};

function getTrialDaysLeft(tool) {
  if (!tool?.freeTrialDays) return 0;
  const end = new Date(tool.publishedAt);
  end.setDate(end.getDate() + tool.freeTrialDays);
  return Math.max(0, Math.ceil((end - new Date()) / 86400000));
}
const fmt = (p) => (!p || p === 0) ? 'Free' : `₩${p.toLocaleString()}`;

function getTimeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PostCard({ post, onLike }) {
  const { user } = useAuth();
  const style = typeStyles[post.type] || typeStyles.TIP;
  const liked = post.likes?.length > 0;
  const timeAgo = getTimeAgo(post.createdAt);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const r = await fetch(`/api/posts/${post.id}/comments`);
        const d = await r.json();
        setComments(d.comments || []);
      } catch {}
      finally { setLoadingComments(false); }
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const r = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setComments([d.comment, ...comments]);
      setCommentText('');
    } catch (e) { alert(e.message); }
    finally { setPosting(false); }
  };

  return (
    <div className="bg-bg-1 border border-bg-3 rounded-xl p-4 hover:border-bg-4 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-bg-3 flex items-center justify-center text-xs font-bold text-tx-1">{post.author?.name?.[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-tx-0">{post.author?.name}</div>
          <div className="text-[10px] text-tx-3">{timeAgo}</div>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${style.cls}`}>{style.label}</span>
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold mb-1">{post.title}</h3>
      <p className="text-xs text-tx-2 leading-relaxed mb-3">{post.body}</p>

      {/* Embedded tool card */}
      {post.tool && (
        <Link href={`/tool/${post.tool.id}`} className="block bg-bg-2 border border-bg-3 rounded-lg p-3 mb-3 hover:border-bg-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-bg-3 flex items-center justify-center text-sm">🤖</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold line-clamp-1">{post.tool.name}</h4>
              <p className="text-[10px] text-tx-3">{post.tool.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {(() => {
                const d = getTrialDaysLeft(post.tool);
                if (d > 0) return <><div className="text-[11px] font-semibold text-acc-2">Free</div><span className="text-[9px] text-acc-2">{d}d left</span></>;
                return <div className="text-[11px] font-semibold">{fmt(post.tool.isOneTimeEnabled ? post.tool.oneTimePrice : post.tool.subscriptionPrice)}{post.tool.isSubscriptionEnabled ? '/mo' : ''}</div>;
              })()}
            </div>
          </div>
        </Link>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {post.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-bg-2 text-tx-2">#{t}</span>)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-2 border-t border-bg-2">
        <button
          onClick={() => onLike?.(post.id)}
          className={`text-[11px] flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'text-tx-3 hover:text-tx-1'}`}
        >
          {liked ? '♥' : '♡'} {post._count?.likes || 0}
        </button>
        <button
          onClick={toggleComments}
          className={`text-[11px] flex items-center gap-1 transition-colors ${showComments ? 'text-acc' : 'text-tx-3 hover:text-tx-1'}`}
        >
          💬 {post._count?.comments || 0}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-bg-2">
          {/* Comment input */}
          {user ? (
            <form onSubmit={submitComment} className="flex gap-2 mb-3">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 text-xs"
                placeholder="댓글을 작성하세요..."
                required
              />
              <button
                type="submit"
                disabled={posting}
                className="px-3 py-1.5 rounded-md bg-acc text-bg-0 text-[11px] font-semibold hover:brightness-110 disabled:opacity-50 flex-shrink-0"
              >
                {posting ? '...' : '등록'}
              </button>
            </form>
          ) : (
            <p className="text-[11px] text-tx-3 mb-3">
              댓글을 작성하려면 <a href="/login" className="text-acc hover:underline">로그인</a>이 필요합니다
            </p>
          )}

          {/* Comment list */}
          {loadingComments ? (
            <div className="text-[11px] text-tx-3 py-2">댓글 불러오는 중...</div>
          ) : comments.length === 0 ? (
            <div className="text-[11px] text-tx-3 py-2">아직 댓글이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-bg-3 flex items-center justify-center text-[9px] font-bold text-tx-2 flex-shrink-0">{c.user?.name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-tx-0">{c.user?.name}</span>
                      <span className="text-[10px] text-tx-3">{getTimeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-tx-2 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
