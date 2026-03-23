'use client';
import Link from 'next/link';

const fmt = (p) => (!p || p === 0) ? 'Free' : `₩${p.toLocaleString()}`;
const emojis = { general: '🤖', automation: '⚙️', content: '✍️', data: '📊', marketing: '🎯', productivity: '📋' };
const bgs = { general: 'from-[#1a1a2e] to-[#2a1a3e]', automation: 'from-[#0e1f1a] to-[#1a2e2a]', content: 'from-[#1f1a0e] to-[#2e2a1a]', data: 'from-[#0e1a2e] to-[#1a2a3e]', marketing: 'from-[#1f0e1a] to-[#2e1a2a]', productivity: 'from-[#1f0e0e] to-[#2e1a1a]' };

function getTrialDaysLeft(tool) {
  if (!tool.freeTrialDays) return 0;
  const end = new Date(tool.publishedAt);
  end.setDate(end.getDate() + tool.freeTrialDays);
  return Math.max(0, Math.ceil((end - new Date()) / 86400000));
}

export default function ToolCard({ tool }) {
  const days = getTrialDaysLeft(tool);
  return (
    <Link href={`/tool/${tool.id}`} className="group block">
      <div className="bg-bg-1 border border-bg-3 rounded-xl overflow-hidden hover:border-acc transition-all duration-200 hover:-translate-y-0.5">
        <div className={`h-20 bg-gradient-to-br ${bgs[tool.category] || bgs.general} flex items-center justify-center text-2xl relative`}>
          {emojis[tool.category] || '🤖'}
          <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-tx-2">{tool.category}</span>
          {days > 0 ? (
            <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-acc-2/15 text-acc-2 font-semibold">{days}d free</span>
          ) : (tool.oneTimePrice && tool.oneTimePrice > 0) ? (
            <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">🔒 유료</span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="text-xs font-semibold text-tx-0 mb-1 line-clamp-1 group-hover:text-acc transition-colors">{tool.name}</h3>
          <p className="text-[11px] text-tx-2 line-clamp-2 leading-relaxed mb-2 min-h-[30px]">{tool.description}</p>
          <div className="flex justify-between items-end">
            <div>
              {days > 0 ? <div className="text-[11px] font-semibold text-acc-2">Free trial</div> : (
                <div className="text-[11px] font-semibold text-tx-0">{fmt(tool.oneTimePrice)}</div>
              )}
            </div>
            <div className="text-[10px] text-tx-3">{tool.creator?.name}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
