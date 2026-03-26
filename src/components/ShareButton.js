'use client';
import { useState } from 'react';

export default function ShareButton({ url, title }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' | crypee')}&url=${encodeURIComponent(url)}`, '_blank');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-full bg-bg-2 text-tx-3 text-[11px] font-semibold hover:bg-bg-3 transition-colors">
        {copied ? '✓ 복사됨' : '공유 ↗'}
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 right-0 bg-bg-1 border border-bg-3 rounded-lg py-1 text-xs z-50 w-36">
          <button onClick={copyLink} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1">📋 링크 복사</button>
          <button onClick={shareTwitter} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1">🐦 트위터 공유</button>
        </div>
      )}
    </div>
  );
}
