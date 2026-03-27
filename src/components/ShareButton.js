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

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' | crypee')}&url=${encodeURIComponent(url)}`, '_blank');
    setOpen(false);
  };

  const shareInsta = () => {
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다. 인스타그램 스토리에 붙여넣기 해주세요!');
    setOpen(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-full bg-bg-2 text-tx-3 text-[11px] font-semibold hover:bg-bg-3 transition-colors">
        {copied ? '✓ 복사됨' : '공유 ↗'}
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 right-0 bg-bg-1 border border-bg-3 rounded-lg py-1 text-xs z-50 w-44 shadow-lg">
          <button onClick={shareX} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1 flex items-center gap-2">
            <img src="https://abs.twimg.com/favicons/twitter.3.ico" alt="X" className="w-4 h-4" /> X (트위터)
          </button>
          <button onClick={shareInsta} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1 flex items-center gap-2">
            <img src="https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png" alt="Instagram" className="w-4 h-4 rounded" /> 인스타그램
          </button>
          <button onClick={shareFacebook} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1 flex items-center gap-2">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-4 h-4" /> 페이스북
          </button>
          <button onClick={copyLink} className="w-full text-left px-3 py-2 hover:bg-bg-2 text-tx-1 flex items-center gap-2">
            📋 링크 복사
          </button>
        </div>
      )}
    </div>
  );
}
