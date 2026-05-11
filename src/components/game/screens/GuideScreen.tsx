'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { guideSections } from '@/lib/guide-data';
import { Input } from '@/components/ui/input';
import { Search, Expand, Shrink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuideSectionCard from '@/components/guide/GuideSectionCard';

export default function GuideScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const allExpanded = Object.keys(expandedSections).length === guideSections.length &&
    Object.values(expandedSections).every(Boolean);

  const filteredSections = guideSections.filter((section) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(q) ||
      section.summary.toLowerCase().includes(q) ||
      section.content.toLowerCase().includes(q) ||
      section.tips.some((tip) => tip.toLowerCase().includes(q))
    );
  });

  const handleToggle = (id: string) => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) setExpandedSections({});
    else {
      const all: Record<string, boolean> = {};
      guideSections.forEach((s) => { all[s.id] = true; });
      setExpandedSections(all);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Game Guide</h2>
        <p className="mt-1 text-sm text-zinc-500">Learn the mechanics, strategies, and rules of the game.</p>
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search the guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-zinc-600"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleAll}
          className="h-10 w-10 shrink-0 border border-white/[0.08] text-zinc-400 hover:text-white"
          title={allExpanded ? 'Collapse all' : 'Expand all'}>
          {allExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {filteredSections.map((section) => (
          <GuideSectionCard
            key={section.id}
            section={section}
            isOpen={expandedSections[section.id] ?? false}
            onToggle={handleToggle}
          />
        ))}
        {filteredSections.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-500">No sections found.</div>
        )}
      </div>
    </div>
  );
}
