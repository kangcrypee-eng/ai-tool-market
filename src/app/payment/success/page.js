'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const toolId = params.get('toolId');
  const type = params.get('type');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="text-lg font-semibold mb-2">
        {type === 'subscription' ? '구독이 완료되었습니다' : '결제가 완료되었습니다'}
      </h1>
      <p className="text-sm text-tx-3 mb-6">
        {type === 'subscription' ? '매월 자동 결제됩니다. My 페이지에서 구독을 관리할 수 있습니다.' : '이제 툴을 자유롭게 사용할 수 있습니다.'}
      </p>
      <div className="flex gap-3">
        {toolId && (
          <Link href={`/tool/${toolId}`} className="px-5 py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">
            툴로 이동
          </Link>
        )}
        <Link href="/my" className="px-5 py-2.5 rounded-lg bg-bg-2 border border-bg-3 text-tx-1 text-xs font-semibold hover:bg-bg-3">
          My 페이지
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse h-20 w-48 bg-bg-2 rounded-xl" /></div>}><SuccessContent /></Suspense>;
}
