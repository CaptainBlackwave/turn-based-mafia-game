'use client';

import React from 'react';
import { useGameStore } from '@/lib/game-store';

export default function GameSidebar() {
  const { currentScreen, setCurrentScreen, setSidebarOpen, setLoggedOut } = useGameStore();
  return null; // Sidebar is embedded in GameLayout
}
