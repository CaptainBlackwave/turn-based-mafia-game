'use client';

import React from 'react';

export default function GuideFooter() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#06060a]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-[#d4af37]">The Mafia Boss</p>
            <p className="mt-1 text-xs text-zinc-500">
              The original free-to-play mafia strategy game since 2004
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span>19 Guide Sections</span>
            <span className="h-3 w-px bg-zinc-700" />
            <span>1,986,229+ Players</span>
            <span className="h-3 w-px bg-zinc-700" />
            <span>10-Day Rounds</span>
          </div>
        </div>
        <div className="mt-4 h-px bg-white/[0.04]" />
        <p className="mt-4 text-center text-[11px] text-zinc-600">
          Content sourced from TheMafiaBoss.com. Built as a modern guide experience.
        </p>
      </div>
    </footer>
  );
}
