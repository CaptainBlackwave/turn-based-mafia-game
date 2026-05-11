'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, RotateCcw, Timer, TrendingUp, Users, UserPlus, Briefcase,
  Shield, Smile, ShoppingBag, Factory, Wallet, Landmark, Swords,
  Flame, MapPin, Trophy, ShieldCheck, Crown, Menu, X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap: Record<string, LucideIcon> = {
  Zap, RotateCcw, Timer, TrendingUp, Users, UserPlus, Briefcase,
  Shield, Smile, ShoppingBag, Factory, Wallet, Landmark, Swords,
  Flame, MapPin, Trophy, ShieldCheck, Crown,
};

const colorDotMap: Record<string, string> = {
  amber: 'bg-amber-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-500', purple: 'bg-purple-500', teal: 'bg-teal-500',
  orange: 'bg-orange-500', red: 'bg-red-500', pink: 'bg-pink-500',
  slate: 'bg-slate-400', lime: 'bg-lime-500', green: 'bg-green-500',
  cyan: 'bg-cyan-500', rose: 'bg-rose-500', sky: 'bg-sky-500',
  violet: 'bg-violet-500',
};

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  summary: string;
  content: string;
  tips: string[];
  order: number;
}

interface GuideSidebarProps {
  sections: GuideSection[];
  activeSection: string | null;
  onSectionClick: (id: string) => void;
}

export default function GuideSidebar({ sections, activeSection, onSectionClick }: GuideSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = (
    <ScrollArea className="h-full">
      <div className="space-y-0.5 p-3">
        <div className="mb-4 px-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]/70">
            Game Guide
          </h2>
          <div className="mt-1 h-px bg-gradient-to-r from-[#d4af37]/30 to-transparent" />
        </div>
        {sections.map((section) => {
          const Icon = iconMap[section.icon] ?? Zap;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => {
                onSectionClick(section.id);
                setMobileOpen(false);
              }}
              className={`
                group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm
                transition-all duration-200
                ${isActive
                  ? 'bg-[#d4af37]/10 text-[#d4af37]'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }
              `}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colorDotMap[section.color] ?? 'bg-zinc-500'}`} />
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-zinc-500 group-hover:text-zinc-300'}`} strokeWidth={1.8} />
              <span className="truncate font-medium">{section.title}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0f]/90 text-zinc-400 backdrop-blur-md hover:text-white lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-72 border-r border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl lg:hidden"
          >
            {navItems}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen w-64 shrink-0 border-r border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-md">
        {navItems}
      </aside>
    </>
  );
}
