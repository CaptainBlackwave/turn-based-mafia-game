'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users } from 'lucide-react';
import Image from 'next/image';

export default function GuideHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/mafia-hero.png"
          alt="The Mafia Boss - Game Guide"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/90 to-[#0a0a0f]" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-1.5"
          >
            <BookOpen className="h-4 w-4 text-[#d4af37]" strokeWidth={1.8} />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4af37]">
              Complete Game Guide
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            The Mafia Boss
            <span className="block text-[#d4af37]">Game Guide</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Master the underworld. Learn strategies, roles, family mechanics, and how to climb the ranks in this free mafia strategy game.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#d4af37]" strokeWidth={1.8} />
              <span className="text-sm font-medium text-zinc-300">
                <span className="font-bold text-white">1,986,229</span> Mafiosos
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="text-sm font-medium text-zinc-300">
              <span className="font-bold text-white">19</span> Guide Sections
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="text-sm font-medium text-zinc-300">
              <span className="font-bold text-white">10</span>-Day Rounds
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
    </section>
  );
}
