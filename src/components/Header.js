'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [path]);

  const navLink = (href, label) => (
    <Link href={href}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${path === href ? 'bg-bg-2 text-acc' : 'text-tx-2 hover:text-tx-0 hover:bg-bg-3'}`}>
      {label}
    </Link>
  );

  const mobileNavLink = (href, label) => (
    <Link href={href}
      className={`block px-4 py-2.5 text-sm transition-colors ${path === href ? 'text-acc bg-bg-2' : 'text-tx-1 hover:bg-bg-2'}`}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-bg-1 border-b border-bg-3">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm text-acc">
          <span className="text-base">⚡</span> crypee
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLink('/', 'Home')}
          {navLink('/guide', 'Guide')}
          {user && navLink('/my', 'My')}
          {user?.role === 'ADMIN' && navLink('/admin', 'Admin')}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop user menu */}
          <div className="hidden sm:block">
            {loading ? <div className="w-16 h-7 bg-bg-3 rounded animate-pulse" /> : user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-bg-3 transition-colors">
                  <div className="w-6 h-6 rounded-md bg-bg-3 flex items-center justify-center text-[10px] font-bold text-acc">{user.name?.[0]}</div>
                  <span className="text-xs text-tx-2">{user.name}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-1 w-44 bg-bg-1 rounded-lg border border-bg-3 py-1 text-xs z-50">
                    <div className="px-3 py-2 text-tx-3 border-b border-bg-3">{user.email}</div>
                    <Link href="/my" className="block px-3 py-2 text-tx-1 hover:bg-bg-2" onClick={() => setOpen(false)}>My page</Link>
                    <Link href="/settings" className="block px-3 py-2 text-tx-1 hover:bg-bg-2" onClick={() => setOpen(false)}>Settings</Link>
                    <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2 text-red-400 hover:bg-bg-2">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-3 py-1.5 text-xs text-tx-2 hover:text-tx-0">Login</Link>
                <Link href="/register" className="px-3 py-1.5 text-xs font-medium bg-acc text-bg-0 rounded-md hover:brightness-110">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-md text-tx-2 hover:bg-bg-3 transition-colors"
          >
            <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-bg-3 bg-bg-1">
          <nav className="py-2">
            {mobileNavLink('/', 'Home')}
            {mobileNavLink('/guide', 'Guide')}
            {user && mobileNavLink('/my', 'My')}
            {user && mobileNavLink('/settings', 'Settings')}
            {user?.role === 'ADMIN' && mobileNavLink('/admin', 'Admin')}
          </nav>
          <div className="border-t border-bg-3 px-4 py-3">
            {loading ? null : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-bg-3 flex items-center justify-center text-[10px] font-bold text-acc">{user.name?.[0]}</div>
                  <div>
                    <div className="text-xs font-semibold text-tx-0">{user.name}</div>
                    <div className="text-[10px] text-tx-3">{user.email}</div>
                  </div>
                </div>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-xs text-red-400 hover:underline">Logout</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1 text-center px-3 py-2 text-xs text-tx-2 border border-bg-3 rounded-md hover:bg-bg-2">Login</Link>
                <Link href="/register" className="flex-1 text-center px-3 py-2 text-xs font-medium bg-acc text-bg-0 rounded-md hover:brightness-110">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
