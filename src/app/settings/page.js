'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading: authLoad, refetch } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('profile');

  // Profile
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (authLoad) return;
    if (!user) { router.push('/login'); return; }
    setName(user.name || '');
    setBio(user.bio || '');
  }, [user, authLoad]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileBusy(true);
    setProfileMsg(null);
    try {
      const r = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfileMsg({ type: 'ok', text: '프로필이 저장되었습니다.' });
      refetch();
    } catch (e) {
      setProfileMsg({ type: 'err', text: e.message });
    } finally {
      setProfileBusy(false);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'err', text: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }
    setPwBusy(true);
    try {
      const r = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPwMsg({ type: 'ok', text: '비밀번호가 변경되었습니다.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e) {
      setPwMsg({ type: 'err', text: e.message });
    } finally {
      setPwBusy(false);
    }
  };

  if (authLoad) return <div className="max-w-xl mx-auto px-4 py-8"><div className="animate-pulse h-40 bg-bg-2 rounded-xl" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-5">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-bg-1 border border-bg-3 rounded-lg p-1 mb-5">
        {[['profile', 'Profile'], ['password', 'Password']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${tab === k ? 'bg-bg-3 text-tx-0' : 'text-tx-3 hover:text-tx-1'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="bg-bg-1 border border-bg-3 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-tx-2 mb-1">Email</label>
            <input value={user?.email || ''} disabled className="w-full opacity-50 cursor-not-allowed" />
            <p className="text-[10px] text-tx-3 mt-1">이메일은 변경할 수 없습니다.</p>
          </div>
          <div>
            <label className="block text-xs text-tx-2 mb-1">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full" maxLength={30} required />
          </div>
          <div>
            <label className="block text-xs text-tx-2 mb-1">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full h-20 resize-none" maxLength={200} />
            <p className="text-[10px] text-tx-3 mt-1 text-right">{bio.length}/200</p>
          </div>
          {profileMsg && (
            <p className={`text-xs ${profileMsg.type === 'ok' ? 'text-acc-2' : 'text-red-400'}`}>{profileMsg.text}</p>
          )}
          <button type="submit" disabled={profileBusy}
            className="px-5 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
            {profileBusy ? '저장 중...' : '저장'}
          </button>
        </form>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <form onSubmit={changePw} className="bg-bg-1 border border-bg-3 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-tx-2 mb-1">Current password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full" required />
          </div>
          <div>
            <label className="block text-xs text-tx-2 mb-1">New password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full" minLength={6} required />
          </div>
          <div>
            <label className="block text-xs text-tx-2 mb-1">Confirm new password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full" minLength={6} required />
          </div>
          {pwMsg && (
            <p className={`text-xs ${pwMsg.type === 'ok' ? 'text-acc-2' : 'text-red-400'}`}>{pwMsg.text}</p>
          )}
          <button type="submit" disabled={pwBusy}
            className="px-5 py-2 rounded-lg bg-acc text-bg-0 text-xs font-semibold hover:brightness-110 disabled:opacity-50">
            {pwBusy ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}
    </div>
  );
}
