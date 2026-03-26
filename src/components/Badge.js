const BADGES = {
  EARLY_BUILDER: { label: '🔨 얼리 빌더', cls: 'bg-acc/10 text-acc' },
  WINNER_1: { label: '🥇 대상', cls: 'bg-[#EF9F27]/15 text-[#EF9F27]' },
  WINNER_2: { label: '🥈 최우수', cls: 'bg-[#B4B2A9]/12 text-[#B4B2A9]' },
  WINNER_3: { label: '🥉 우수', cls: 'bg-[#ce9178]/12 text-[#ce9178]' },
  CREATOR: { label: '⚡ 크리에이터', cls: 'bg-acc-2/10 text-acc-2' },
  BROKER: { label: '🎯 브로커', cls: 'bg-acc-4/10 text-acc-4' },
  BROKER_SILVER: { label: '🥈 실버 브로커', cls: 'bg-acc-4/10 text-acc-4' },
  BROKER_GOLD: { label: '🏆 골드 브로커', cls: 'bg-acc-4/10 text-acc-4' },
};

export default function Badge({ code }) {
  const b = BADGES[code];
  if (!b) return null;
  return <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${b.cls}`}>{b.label}</span>;
}
