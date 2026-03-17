import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../lib/api';
import { getAuthToken, setAuthToken } from '../lib/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getAuthToken()) navigate('/');
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await api.login({ email: normalizedEmail, password });
      setAuthToken(result.token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-white/12 bg-[#2b2d31] shadow-[0_28px_80px_-46px_rgba(0,0,0,0.95)] grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 md:p-8 bg-[#313338]">
          <h1 className="text-2xl md:text-[28px] font-bold mb-1 text-white">Welcome back!</h1>
          <p className="text-sm text-slate-300 mb-7">We're so excited to see you again!</p>

          <form onSubmit={onSubmit} className="space-y-4 mb-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#1e1f22] bg-[#1e1f22] px-3 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wide text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[#1e1f22] bg-[#1e1f22] px-3 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-[#5865f2] text-white py-2.5 font-semibold transition-all hover:brightness-105 disabled:opacity-60"
            >
              {busy ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mb-4">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  try {
                    const result = await api.googleLogin(credentialResponse.credential);
                    setAuthToken(result.token);
                    navigate('/');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Google login failed');
                  }
                }}
                onError={() => setError('Google login failed')}
              />
            ) : (
              <button
                type="button"
                className="w-full rounded-md border border-[#1e1f22] bg-[#1e1f22] py-2.5 text-sm text-slate-400"
              >
                Sign in with Google (set VITE_GOOGLE_CLIENT_ID)
              </button>
            )}
          </div>

          <p className="text-sm text-slate-400">
            Need an account?{' '}
            <Link to="/signup" className="text-indigo-300 hover:text-indigo-200 font-medium">
              Register
            </Link>
          </p>

          {error && <p className="mt-4 text-sm text-red-300 bg-red-900/35 border border-red-500/40 rounded-md px-3 py-2">{error}</p>}
        </div>

        <div className="hidden md:flex items-center justify-center bg-[#232428] p-8 text-center">
          <div>
            <div className="w-28 h-28 rounded-2xl border border-white/15 bg-[#111214] mx-auto mb-4 grid place-items-center text-slate-400 text-xs">
              SCAN
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Join Prompt Community</h2>
            <p className="text-sm text-slate-400 max-w-[220px]">
              Connect with the club, explore projects, and stay updated in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
