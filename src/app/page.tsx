'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import AuthScreen from '@/components/game/AuthScreen';
import GameLayout from '@/components/game/GameLayout';
import { calculateNetworth, calculateOpHappiness, calculateSoldierHappiness } from '@/lib/game-engine';

export default function Home() {
  const { isLoggedIn, setLoggedIn, setLoggedOut, setPlayer } = useGameStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.player) {
          const p = data.player;
          setLoggedIn('', {
            ...p,
            networth: p.networth || 0,
            opHappiness: p.opHappiness || 100,
            soldierHappiness: p.soldierHappiness || 100,
          });
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37]" />
          <p className="mt-3 text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <AuthScreen />;
  return <GameLayout />;
}
