import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../lib/api';
import { getAuthToken } from '../lib/auth';

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getAuthToken()) navigate('/server');
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedName = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.signup({ username: normalizedName, email: normalizedEmail, password });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="rounded-3xl border border-white/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.92))] p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.95)] backdrop-blur-xl">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign up to join the chat server.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Username"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Email"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[linear-gradient(135deg,rgba(79,70,229,1),rgba(37,99,235,1))] text-primary-foreground py-2.5 font-semibold transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60 disabled:transform-none"
          >
            {busy ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <Link
          to="/login"
          className="w-full mt-4 inline-flex items-center justify-center rounded-xl border border-white/20 py-2.5 text-sm transition-colors hover:bg-white/5"
        >
          Login
        </Link>

        {error && <p className="mt-4 text-sm text-red-300 bg-red-900/35 border border-red-500/40 rounded-xl px-3 py-2">{error}</p>}
      </div>
    </div>
  );
}
