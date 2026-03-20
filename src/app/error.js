'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-5xl mb-4">!</div>
      <h1 className="text-lg font-semibold mb-2">문제가 발생했습니다</h1>
      <p className="text-sm text-tx-3 mb-6">잠시 후 다시 시도해주세요.</p>
      <button onClick={() => reset()} className="px-5 py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110">
        다시 시도
      </button>
    </div>
  );
}
