'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Badge from '@/components/Badge';
import ShareButton from '@/components/ShareButton';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function EntryDetail({ entry }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(entry._count?.votes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (!user) return alert('로그인이 필요합니다');
    setLikes(l => l + 1);
    setLiked(true);
    fetch(`/api/contests/entries/${entry.id}/like`, { method: 'POST' }).catch(() => {});
  };

  const embedUrl = getYouTubeEmbedUrl(entry.videoUrl);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-6 inline-flex items-center gap-1">← Back</Link>

      {/* Video embed */}
      {embedUrl && (
        <iframe src={embedUrl} className="w-full aspect-video rounded-xl border border-bg-3 mb-6" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      )}
      {!embedUrl && entry.images?.length > 0 && (
        <img src={entry.images[0]} alt="" className="w-full aspect-video object-cover rounded-xl border border-bg-3 mb-6" />
      )}

      <div className="bg-bg-1 border border-bg-3 rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-2">{entry.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-tx-3">by {entry.user?.name}</span>
          {entry.user?.badges?.map(b => <Badge key={b} code={b} />)}
          <span className="text-[10px] text-tx-3">· {new Date(entry.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>

        <p className="text-sm text-tx-2 leading-relaxed whitespace-pre-line mb-6">{entry.description}</p>

        {/* Screenshots */}
        {entry.images?.length > (embedUrl ? 0 : 1) && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
            {entry.images.slice(embedUrl ? 0 : 1).map((img, i) => (
              <img key={i} src={img} alt="" className="h-40 rounded-lg border border-bg-3 object-cover flex-shrink-0" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-bg-2">
          {entry.tryUrl && /^https?:\/\//i.test(entry.tryUrl) && (
            <a href={entry.tryUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-acc/10 text-acc text-xs font-semibold hover:bg-acc/20">
              🔗 사용해보기
            </a>
          )}
          <button onClick={handleLike}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-all ${liked ? 'bg-red-500/10 text-red-400' : 'bg-bg-2 text-tx-3 hover:bg-red-500/10 hover:text-red-400'}`}>
            {liked ? '♥' : '♡'} {likes}
          </button>
          <ShareButton url={url} title={entry.title} />
        </div>

        {/* Contest info */}
        <div className="mt-4 pt-4 border-t border-bg-2">
          <span className="text-[10px] text-tx-3">{entry.contest?.title}</span>
        </div>
      </div>
    </div>
  );
}
