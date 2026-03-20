'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailContent() {
  const params = useSearchParams();
  const message = params.get('message') || '결제 처리 중 문제가 발생했습니다.';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-5xl mb-4">!</div>
      <h1 className="text-lg font-semibold mb-2">결제에 실패했습니다</h1>
      <p className="text-sm text-tx-3 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={() => window.history.back()} className="px-5 py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">
          다시 시도
        </button>
        <Link href="/" className="px-5 py-2.5 rounded-lg bg-bg-2 border border-bg-3 text-tx-1 text-xs font-semibold hover:bg-bg-3">
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse h-20 w-48 bg-bg-2 rounded-xl" /></div>}><FailContent /></Suspense>;
}
