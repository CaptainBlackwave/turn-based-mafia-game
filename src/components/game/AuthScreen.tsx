'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/lib/game-store';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setLoggedIn } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Calculate networth and happiness
      const p = data.player;
      const networth = p.operatives * 1500 + p.soldiers * 600 +
        p.alcohol * 1 + p.weed * 2 + p.coke * 5 +
        p.glocks * 400 + p.shotguns * 800 + p.uzis * 2000 + p.ak47s * 4000 +
        p.chryslers * 8000 + p.limos * 40000 +
        p.gulfstreams * 40000 + p.boeings * 250000 +
        p.cash + p.bank;

      const opHappiness = p.operatives === 0 ? 100 : Math.min(
        Math.round(
          (Math.min(p.alcohol / Math.max(p.operatives, 1), 1) * 30 +
           Math.min(p.coke / Math.max(p.operatives, 1), 1) * 35 +
           Math.min(p.soldiers / Math.max(p.operatives * 0.5, 1), 1) * 35)
        ), 100);

      const soldierHappiness = p.soldiers === 0 ? 100 : Math.min(
        Math.round(
          (Math.min(p.alcohol / Math.max(p.soldiers, 1), 1) * 25 +
           Math.min(p.weed / Math.max(p.soldiers, 1), 1) * 30 +
           Math.min((p.glocks + p.shotguns + p.uzis + p.ak47s) / Math.max(p.soldiers * 2, 1), 1) * 45)
        ), 100);

      setLoggedIn('', {
        ...p,
        networth,
        opHappiness,
        soldierHappiness,
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      {/* Background pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect */}
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-b from-[#d4af37]/20 via-transparent to-[#d4af37]/10 blur-xl" />

        <div className="relative rounded-2xl border border-white/[0.08] bg-[#0f0f18]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4af37]/10 ring-1 ring-[#d4af37]/20">
              <Skull className="h-8 w-8 text-[#d4af37]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              The Mafia Boss
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {isLogin ? 'Welcome back, Don.' : 'Start your criminal empire.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1.5 text-xs font-medium text-zinc-400">Username</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:ring-[#d4af37]/20"
                required
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-medium text-zinc-400">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="border-white/[0.08] bg-white/[0.03] pr-10 text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:ring-[#d4af37]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-600">
            {isLogin ? 'New to the game? ' : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#d4af37] hover:underline"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
