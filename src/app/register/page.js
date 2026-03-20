'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.push('/'); }, [user, loading]);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await register(f.email, f.password, f.name, f.bio); router.push('/'); }
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
            <div>
              <label className="block text-xs text-tx-2 mb-1">Bio (optional)</label>
              <input type="text" value={f.bio} onChange={e => setF({...f, bio: e.target.value})} className="w-full" placeholder="AI automation enthusiast" maxLength={200} />
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all">
              {busy ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-xs text-tx-3 mt-5">
            이미 계정이 있으신가요? <Link href="/login" className="text-acc hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
