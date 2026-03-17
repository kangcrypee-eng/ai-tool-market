'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await login(email, password); router.push('/'); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-bg-1 border border-bg-3 rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold mb-1">Login</h1>
            <p className="text-xs text-tx-3">crypee에 로그인</p>
          </div>
          {error && <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 text-red-400 text-xs">{error}</div>}
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-tx-2 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-xs text-tx-2 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all">
              {busy ? 'Loading...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-xs text-tx-3 mt-5">
            계정이 없으신가요? <Link href="/register" className="text-acc hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
