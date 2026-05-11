'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Lightbulb,
  Zap,
  RotateCcw,
  Timer,
  TrendingUp,
  Users,
  UserPlus,
  Briefcase,
  Shield,
  Smile,
  ShoppingBag,
  Factory,
  Wallet,
  Landmark,
  Swords,
  Flame,
  MapPin,
  Trophy,
  ShieldCheck,
  Crown,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

// Types
export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  summary: string;
  content: string;
  tips: string[];
  order: number;
}

// Icon mapping — matches the icon names used in guide-data.ts
const iconMap: Record<string, LucideIcon> = {
  Zap,
  RotateCcw,
  Timer,
  TrendingUp,
  Users,
  UserPlus,
  Briefcase,
  Shield,
  Smile,
  ShoppingBag,
  Factory,
  Wallet,
  Landmark,
  Swords,
  Flame,
  MapPin,
  Trophy,
  ShieldCheck,
  Crown,
};

// Color mapping
const colorMap: Record<string, { bar: string; badgeBg: string; badgeText: string; glow: string }> = {
  amber:   { bar: 'bg-amber-500',        badgeBg: 'bg-amber-500/15',       badgeText: 'text-amber-400',        glow: 'shadow-amber-500/10' },
  yellow:  { bar: 'bg-yellow-500',       badgeBg: 'bg-yellow-500/15',      badgeText: 'text-yellow-400',       glow: 'shadow-yellow-500/10' },
  red:     { bar: 'bg-red-600',           badgeBg: 'bg-red-600/15',         badgeText: 'text-red-400',           glow: 'shadow-red-600/10' },
  rose:    { bar: 'bg-rose-500',          badgeBg: 'bg-rose-500/15',        badgeText: 'text-rose-400',          glow: 'shadow-rose-500/10' },
  blue:    { bar: 'bg-blue-500',          badgeBg: 'bg-blue-500/15',        badgeText: 'text-blue-400',          glow: 'shadow-blue-500/10' },
  emerald: { bar: 'bg-emerald-500',       badgeBg: 'bg-emerald-500/15',     badgeText: 'text-emerald-400',       glow: 'shadow-emerald-500/10' },
  purple:  { bar: 'bg-purple-500',        badgeBg: 'bg-purple-500/15',      badgeText: 'text-purple-400',        glow: 'shadow-purple-500/10' },
  orange:  { bar: 'bg-orange-500',        badgeBg: 'bg-orange-500/15',      badgeText: 'text-orange-400',        glow: 'shadow-orange-500/10' },
  pink:    { bar: 'bg-pink-500',          badgeBg: 'bg-pink-500/15',        badgeText: 'text-pink-400',          glow: 'shadow-pink-500/10' },
  cyan:    { bar: 'bg-cyan-500',          badgeBg: 'bg-cyan-500/15',        badgeText: 'text-cyan-400',          glow: 'shadow-cyan-500/10' },
  green:   { bar: 'bg-green-500',         badgeBg: 'bg-green-500/15',       badgeText: 'text-green-400',         glow: 'shadow-green-500/10' },
  violet:  { bar: 'bg-violet-500',        badgeBg: 'bg-violet-500/15',      badgeText: 'text-violet-400',        glow: 'shadow-violet-500/10' },
  teal:    { bar: 'bg-teal-500',          badgeBg: 'bg-teal-500/15',        badgeText: 'text-teal-400',          glow: 'shadow-teal-500/10' },
  lime:    { bar: 'bg-lime-500',          badgeBg: 'bg-lime-500/15',        badgeText: 'text-lime-400',          glow: 'shadow-lime-500/10' },
  sky:     { bar: 'bg-sky-500',           badgeBg: 'bg-sky-500/15',         badgeText: 'text-sky-400',           glow: 'shadow-sky-500/10' },
  slate:   { bar: 'bg-slate-400',         badgeBg: 'bg-slate-400/15',       badgeText: 'text-slate-300',         glow: 'shadow-slate-400/10' },
};

const defaultColor = colorMap.amber;

// Animation variants
const contentVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' as const },
  visible: {
    opacity: 1,
    height: 'auto',
    overflow: 'hidden' as const,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: 'hidden' as const,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

interface GuideSectionCardProps {
  section: GuideSection;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (id: string) => void;
}

export default function GuideSectionCard({ section, defaultOpen = false, isOpen, onToggle }: GuideSectionCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultOpen);
  const isExpanded = isOpen !== undefined ? isOpen : internalExpanded;
  const handleToggle = () => {
    if (onToggle) {
      onToggle(section.id);
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const Icon = iconMap[section.icon] ?? Zap;
  const colors = colorMap[section.color] ?? defaultColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(section.order * 0.04, 0.8), ease: 'easeOut' }}
      className="group relative"
    >
      {/* Ambient glow on hover */}
      <div
        className={`
          pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-xl transition-opacity duration-500
          group-hover:opacity-100
          ${colors.glow}
        `}
      />

      <Card
        className={`
          relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0f]/90
          backdrop-blur-md transition-all duration-300
          hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/40
          ${isExpanded ? 'shadow-lg shadow-black/40 border-white/[0.12]' : ''}
        `}
      >
        {/* Left colour bar */}
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-300 ${colors.bar} ${
            isExpanded ? 'w-1.5' : ''
          }`}
        />

        {/* Header (always visible) */}
        <CardHeader
          className="cursor-pointer select-none px-5 py-4 sm:px-6"
          onClick={handleToggle}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon badge */}
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                ring-1 ring-white/[0.06] sm:h-11 sm:w-11
                ${colors.badgeBg}
              `}
            >
              <Icon className={`h-5 w-5 ${colors.badgeText}`} strokeWidth={1.8} />
            </div>

            {/* Title + summary */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge
                  variant="outline"
                  className="h-5 min-w-5 justify-center border-[#d4af37]/30 bg-[#d4af37]/10 px-1.5 text-[10px] font-bold text-[#d4af37]"
                >
                  {section.order}
                </Badge>
                <h3 className="truncate text-base font-semibold tracking-wide text-[#d4af37] sm:text-lg">
                  {section.title}
                </h3>
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {section.summary}
              </p>
            </div>

            {/* Chevron */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
            >
              <ChevronDown className="h-5 w-5" strokeWidth={2} />
            </motion.div>
          </div>
        </CardHeader>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CardContent className="px-5 pb-5 pt-0 sm:px-6">
                {/* Divider */}
                <div className="mb-5 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />

                {/* HTML content */}
                <div
                  className="guide-content max-w-none text-sm leading-relaxed text-zinc-300 sm:text-[0.9375rem]"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />

                {/* Tips section */}
                {section.tips.length > 0 && (
                  <div className="mt-6 rounded-lg border border-[#d4af37]/10 bg-[#12121a]/80 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37]/15">
                        <Lightbulb className="h-4 w-4 text-[#d4af37]" strokeWidth={1.8} />
                      </div>
                      <span className="text-sm font-semibold tracking-wide text-[#d4af37]">
                        Pro Tips
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#d4af37]/10 text-[10px] font-bold text-[#d4af37]">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
