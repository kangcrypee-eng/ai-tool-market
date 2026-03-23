'use client';
import { useState } from 'react';
import Link from 'next/link';

const sections = [
  {
    id: 'overview',
    icon: '⚡',
    title: '플랫폼 소개',
    content: [
      { q: 'crypee는 뭔가요?', a: 'crypee는 AI 자동화 툴을 만들고, 공유하고, 판매할 수 있는 커뮤니티 & 마켓 플랫폼입니다. 누구나 자신이 만든 AI 자동화 툴을 등록하고, 다른 사용자들은 그 툴을 체험하고 구매해서 사용할 수 있어요.' },
      { q: '누가 사용할 수 있나요?', a: '누구나 가입할 수 있습니다. 가입 후 바로 커뮤니티에 글을 쓰고, 툴을 구경하고, 무료 체험 중인 툴을 사용할 수 있어요. 본인이 만든 AI 툴이 있다면 등록해서 판매할 수도 있습니다. 별도의 크리에이터 전환 없이 누구나 바로 등록 가능합니다.' },
      { q: 'Community와 Market은 뭐가 다른가요?', a: 'Community는 자유롭게 글을 쓰고 읽는 공간입니다. 팁, 질문, 후기, 툴 공유 등 다양한 글을 올릴 수 있어요. Market은 등록된 AI 툴을 카테고리별로 둘러보고, 체험하고, 구매하는 공간입니다.' },
    ],
  },
  {
    id: 'tool-types',
    icon: '📦',
    title: '툴 제공 방식',
    content: [
      { q: '툴은 어떤 형태로 올릴 수 있나요?', a: '크리에이터는 3가지 방식을 자유롭게 조합해서 툴을 제공할 수 있습니다:\n\n🔗 외부 링크 — 노션 템플릿, 웹앱, ChatGPT GPTs, 구글 시트 등 URL\n📁 파일 업로드 — n8n 워크플로우(JSON), Python 스크립트, ZIP 파일 등 다운로드\n📝 텍스트 콘텐츠 — 프롬프트 원문, 사용 가이드, 세팅 방법, 업데이트 노트 등\n\n하나만 제공해도 되고, 세 가지를 모두 제공해도 됩니다.' },
      { q: '텍스트 콘텐츠는 뭔가요?', a: '크리에이터가 crypee 안에 직접 작성하는 콘텐츠입니다. 프롬프트 원문, 상세한 사용법, 세팅 가이드, 업데이트 노트 등을 마크다운 형식으로 작성할 수 있어요. 이 콘텐츠는 crypee에 로그인하고 접근 권한이 있어야만 볼 수 있습니다.' },
      { q: '왜 텍스트 콘텐츠가 중요한가요?', a: '파일이나 링크만으로는 툴을 제대로 활용하기 어려운 경우가 많습니다. 텍스트 콘텐츠에 상세한 사용법과 프롬프트를 담으면, 구매자는 crypee에서만 이 정보에 접근할 수 있어요. 크리에이터에게는 콘텐츠 보호 효과가, 구매자에게는 지속적인 가이드 접근이 보장됩니다.' },
      { q: '크리에이터에게 추천하는 등록 방식은?', a: '가장 효과적인 방법은 파일/링크(툴 자체)와 텍스트 콘텐츠(사용법)를 함께 제공하는 겁니다. 예를 들어:\n\n• n8n 워크플로우 JSON(파일) + 세팅 가이드(텍스트 콘텐츠)\n• GPTs 링크(외부 링크) + 프롬프트 원문과 활용 팁(텍스트 콘텐츠)\n• Python 스크립트(파일) + 설치 방법과 사용 예시(텍스트 콘텐츠)' },
    ],
  },
  {
    id: 'free-trial',
    icon: '🎁',
    title: '30일 무료 체험',
    content: [
      { q: '무료 체험은 어떻게 되나요?', a: '모든 신규 툴은 등록된 날로부터 30일간 누구나 무료로 사용할 수 있습니다. 외부 링크, 파일 다운로드, 텍스트 콘텐츠 모두 무료 체험 기간 동안 전부 접근 가능합니다. 별도의 카드 등록이나 결제 없이 바로 이용할 수 있어요.' },
      { q: '무료 기간이 끝나면 어떻게 되나요?', a: '30일이 지나면 해당 툴의 외부 링크, 파일, 텍스트 콘텐츠가 잠깁니다. 툴의 소개(설명)는 계속 볼 수 있지만, 실제 콘텐츠에 접근하려면 결제가 필요합니다. 크리에이터가 설정한 가격에 따라 1회 구매 또는 월 구독으로 이용할 수 있어요.' },
      { q: '무료 기간은 누가 정하나요?', a: '크리에이터가 툴을 등록할 때 무료 체험 기간을 직접 설정할 수 있습니다. 기본은 30일이지만, 더 길거나 짧게 설정할 수도 있어요.' },
      { q: '1회 구매하면 영구적으로 사용할 수 있나요?', a: '네. 1회 구매 시 해당 툴의 모든 콘텐츠(링크, 파일, 텍스트)에 영구적으로 접근할 수 있습니다. 크리에이터가 이후에 업데이트하더라도 계속 접근 가능합니다.' },
    ],
  },
  {
    id: 'community',
    icon: '💬',
    title: '커뮤니티 사용법',
    content: [
      { q: '어떤 글을 쓸 수 있나요?', a: '4가지 타입의 글을 작성할 수 있습니다:\n\n💡 Tip — 유용한 팁이나 노하우 공유\n❓ Q&A — 질문이나 도움 요청\n⭐ Review — 툴 사용 후기\n🔧 Tool — 내가 만든 툴 소개' },
      { q: '글은 어떻게 쓰나요?', a: 'Community 탭에서 상단의 "새로운 글을 작성해보세요..." 영역을 클릭하면 작성 폼이 열립니다. 글 타입을 선택하고, 제목과 내용을 입력한 뒤 게시하기를 누르면 됩니다.' },
      { q: '태그는 어떻게 다나요?', a: '태그 입력란에 쉼표(,)로 구분해서 입력하면 됩니다. 예: AI, 자동화, GPT, 마케팅' },
      { q: '좋아요와 댓글은?', a: '각 게시글 하단의 ♡ 버튼으로 좋아요를 누를 수 있고, 💬 버튼을 클릭하면 댓글을 보고 작성할 수 있습니다.' },
      { q: '내가 쓴 글이나 댓글을 삭제할 수 있나요?', a: '네. 본인이 작성한 게시글은 우측 상단의 ⋯ 메뉴에서 삭제할 수 있고, 댓글은 마우스를 올리면 나타나는 삭제 버튼으로 삭제할 수 있습니다.' },
    ],
  },
  {
    id: 'tools',
    icon: '🛠️',
    title: '툴 등록 & 판매',
    content: [
      { q: '툴은 어떻게 등록하나요?', a: '로그인 후 Market 탭에서 "새로운 AI 툴을 등록해보세요..." 버튼을 클릭하거나, My 페이지에서 "+ New tool" 버튼을 클릭합니다. 이름, 설명, 카테고리를 입력하고, 외부 링크 / 파일 / 텍스트 콘텐츠를 자유롭게 조합하여 등록합니다. 등록 후 관리자 승인을 거쳐 마켓에 공개됩니다.' },
      { q: '가격은 어떻게 설정하나요?', a: '두 가지 판매 방식 중 선택할 수 있습니다:\n\n• 1회 구매: 한 번 결제하면 영구 사용\n• 월 구독: 매월 정기 결제\n\n둘 다 활성화할 수도 있고, 하나만 선택할 수도 있습니다. 가격은 자유롭게 설정 가능합니다. 무료 체험 기간(기본 30일) 동안은 가격과 무관하게 모든 유저에게 공개됩니다.' },
      { q: '수수료는 얼마인가요?', a: '결제 금액의 20%가 플랫폼 수수료이고, 약 3%가 PG(결제 대행) 수수료입니다.\n\n예시) 10,000원 결제 시:\n• PG 수수료: 300원\n• 플랫폼 수수료: 2,000원\n• 크리에이터 정산: 7,700원' },
      { q: '정산은 어떻게 받나요?', a: '현재는 월 1회 관리자가 확인 후 수동 정산합니다. My 페이지에서 누적 수익과 정산 예정 금액을 확인할 수 있습니다.' },
    ],
  },
  {
    id: 'purchase',
    icon: '💳',
    title: '구매 & 결제',
    content: [
      { q: '툴은 어떻게 구매하나요?', a: 'Market에서 원하는 툴을 클릭하면 상세 페이지로 이동합니다. 무료 체험 기간이 지난 툴은 "1회 구매" 또는 "월 구독" 버튼이 표시됩니다. 버튼을 클릭하면 토스페이먼츠 결제 창이 열리고, 결제를 완료하면 바로 모든 콘텐츠에 접근할 수 있습니다.' },
      { q: '1회 구매와 월 구독의 차이는?', a: '• 1회 구매: 한 번 결제하면 영구적으로 해당 툴의 모든 콘텐츠에 접근 가능\n• 월 구독: 매월 자동 결제되며, 구독 기간 동안 접근 가능. 해지하면 다음 결제일부터 접근 차단' },
      { q: '구독을 해지하고 싶어요', a: 'My 페이지 → Subs 탭에서 구독 중인 툴 옆의 "Cancel" 버튼을 클릭하면 즉시 해지됩니다. 이미 결제된 기간까지는 계속 사용 가능합니다.' },
      { q: '환불은 가능한가요?', a: '1회 구매 후 7일 이내, 툴 콘텐츠를 사용하지 않은 경우 전액 환불 가능합니다. 월 구독은 해지 시 이미 결제된 기간까지 이용 가능하며, 남은 기간에 대한 환불은 원칙적으로 불가합니다. 환불 요청은 contact@crypee.io로 접수할 수 있습니다.' },
      { q: '결제 내역은 어디서 확인하나요?', a: 'My 페이지 → Payments 탭에서 모든 결제 내역을 확인할 수 있습니다.' },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: '계정 관리',
    content: [
      { q: 'My 페이지에서는 뭘 할 수 있나요?', a: 'My 페이지는 통합 프로필입니다. 한 곳에서 다음을 모두 관리할 수 있어요:\n\n• My tools — 내가 등록한 툴, 매출, 정산 현황\n• Owned — 1회 구매한 툴 목록\n• Subs — 구독 중인 툴 관리 (해지 가능)\n• Posts — 내가 작성한 커뮤니티 글\n• Payments — 결제 내역' },
      { q: '프로필을 수정하고 싶어요', a: 'Settings 페이지에서 이름, 소개글을 변경할 수 있고, 비밀번호도 변경 가능합니다. 상단 우측 프로필 클릭 → Settings에서 접근할 수 있어요.' },
      { q: '크리에이터로 전환해야 하나요?', a: '아닙니다! 별도의 역할 전환 없이 누구나 바로 툴을 등록할 수 있습니다. Market에서 "새로운 AI 툴을 등록해보세요..." 버튼을 누르거나, My 페이지에서 "+ New tool" 버튼을 누르면 됩니다.' },
    ],
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (sectionId, idx) => {
    const key = `${sectionId}-${idx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold mb-2">가이드</h1>
        <p className="text-xs text-tx-2">플랫폼 사용법을 한눈에 확인하세요</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar navigation */}
        <nav className="w-48 flex-shrink-0 hidden md:block">
          <div className="sticky top-20 space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeSection === s.id ? 'bg-bg-2 text-tx-0 border border-bg-3' : 'text-tx-3 hover:text-tx-1 hover:bg-bg-1'
                }`}>
                <span className="text-sm">{s.icon}</span> {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile tab bar */}
        <div className="md:hidden flex gap-1 overflow-x-auto pb-3 mb-4 w-full scrollbar-hide">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                activeSection === s.id ? 'bg-acc border-acc text-bg-0' : 'border-bg-3 text-tx-3'
              }`}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {currentSection && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{currentSection.icon}</span>
                <h2 className="text-lg font-semibold">{currentSection.title}</h2>
              </div>

              <div className="space-y-2">
                {currentSection.content.map((item, idx) => {
                  const key = `${currentSection.id}-${idx}`;
                  const isOpen = openItems[key] !== false;
                  return (
                    <div key={idx} className="bg-bg-1 border border-bg-3 rounded-xl overflow-hidden">
                      <button onClick={() => toggleItem(currentSection.id, idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-2/50 transition-colors">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <span className={`text-tx-3 text-xs transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-bg-3 pt-3">
                            <p className="text-xs text-tx-2 leading-relaxed whitespace-pre-line">{item.a}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="mt-8 bg-bg-1 border border-bg-3 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">바로가기</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { href: '/', icon: '💬', label: 'Community' },
                { href: '/', icon: '🛒', label: 'Market' },
                { href: '/my', icon: '👤', label: 'My page' },
                { href: '/register', icon: '✨', label: 'Sign up' },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-2 p-3 rounded-lg bg-bg-2 hover:bg-bg-3 transition-colors text-xs font-medium">
                  <span className="text-sm">{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
