'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-bg-3 bg-bg-1 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sm text-acc mb-3">
              <span className="text-base">⚡</span> crypee
            </Link>
            <p className="text-xs text-tx-3 leading-relaxed">
              AI 자동화 툴을 만들고, 공유하고,<br />함께 성장하는 커뮤니티
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-tx-1 mb-3">서비스</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">Community</Link>
              <Link href="/" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">Market</Link>
              <Link href="/guide" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">Guide</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-tx-1 mb-3">계정</h4>
            <div className="space-y-2">
              <Link href="/login" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">Login</Link>
              <Link href="/register" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">Sign up</Link>
              <Link href="/my" className="block text-xs text-tx-3 hover:text-tx-1 transition-colors">My page</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-tx-1 mb-3">고객지원</h4>
            <div className="space-y-2">
              <span className="block text-xs text-tx-3">문의: contact@crypee.io</span>
              <span className="block text-xs text-tx-3">전화: 010-5077-2773</span>
            </div>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-bg-3 pt-6 mb-6">
          <div className="text-[10px] text-tx-3 leading-relaxed space-y-1">
            <p>주식회사 크리피솔루션즈 | 대표: 민동선</p>
            <p>사업자등록번호: 173-87-02739 | 통신판매업 신고번호: 제 2025-서울강남-04832호</p>
            <p>주소: 서울특별시 강남구 테헤란로 431, 에스7018호 (삼성동, 저스트코타워)</p>
            <p>이메일: contact@crypee.io | 전화: 010-5077-2773</p>
          </div>
        </div>

        <div className="border-t border-bg-3 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-tx-3">© 2025 crypee. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="text-[11px] text-tx-3 hover:text-tx-1">이용약관</Link>
            <Link href="/privacy" className="text-[11px] text-tx-3 hover:text-tx-1">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
