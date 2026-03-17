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
            <h4 className="text-xs font-semibold text-tx-1 mb-3">정보</h4>
            <div className="space-y-2">
              <span className="block text-xs text-tx-3">문의: hello@crypee.com</span>
              <span className="block text-xs text-tx-3">🚧 현재 베타 서비스 운영 중</span>
            </div>
          </div>
        </div>
        <div className="border-t border-bg-3 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-tx-3">© 2025 crypee. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="text-[11px] text-tx-3 hover:text-tx-1 cursor-pointer">이용약관</span>
            <span className="text-[11px] text-tx-3 hover:text-tx-1 cursor-pointer">개인정보처리방침</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
