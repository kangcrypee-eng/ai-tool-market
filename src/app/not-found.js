import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-6xl mb-4">404</div>
      <h1 className="text-lg font-semibold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-tx-3 mb-6">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="px-5 py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
