'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me');
      if (r.ok) { const d = await r.json(); setUser(d.user); }
      else setUser(null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setUser(d.user); return d.user;
  };
  const register = async (email, password, name, bio) => {
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name, bio }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setUser(d.user); return d.user;
  };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refetch: fetchUser }}>{children}</Ctx.Provider>;
}

export function useAuth() { const c = useContext(Ctx); if (!c) throw new Error('useAuth outside provider'); return c; }
