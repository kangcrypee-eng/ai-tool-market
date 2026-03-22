'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.push('/'); }, [user, loading]);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await register(f.email, f.password, f.name); router.push('/'); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold mb-1">Sign up</h1>
            <p className="text-xs text-tx-3">crypee에 가입하고 AI 툴을 만들어보세요</p>
          </div>
          {error && <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 text-red-400 text-xs">{error}</div>}
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-tx-2 mb-1">Name</label>
              <input type="text" value={f.name} onChange={e => setF({...f, name: e.target.value})} className="w-full" placeholder="홍길동" maxLength={30} required />
            </div>
            <div>
              <label className="block text-xs text-tx-2 mb-1">Email</label>
              <input type="email" value={f.email} onChange={e => setF({...f, email: e.target.value})} className="w-full" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-xs text-tx-2 mb-1">Password</label>
              <input type="password" value={f.password} onChange={e => setF({...f, password: e.target.value})} className="w-full" placeholder="6자 이상" minLength={6} required />
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all">
              {busy ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-bg-3" /></div>
            <div className="relative flex justify-center"><span className="px-2 bg-bg-1 text-[10px] text-tx-3">또는</span></div>
          </div>
          <a href="/api/auth/kakao"
            className="w-full py-2.5 rounded-lg bg-[#FEE500] text-[#191919] text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M9 0.6C4.03 0.6 0 3.713 0 7.554c0 2.487 1.638 4.67 4.106 5.9-.134.497-.864 3.2-.895 3.403 0 0-.018.152.08.21.098.058.213.026.213.026.28-.04 3.254-2.14 3.768-2.5.236.034.477.051.728.051 4.97 0 9-3.113 9-6.954C18 3.713 13.97.6 9 .6" fill="#191919"/></svg>
            카카오로 시작하기
          </a>
          <p className="text-center text-xs text-tx-3 mt-5">
            이미 계정이 있으신가요? <Link href="/login" className="text-acc hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
