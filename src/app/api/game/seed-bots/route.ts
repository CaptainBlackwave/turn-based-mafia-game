import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

const BOT_NAMES = [
  'Vito Corleone', 'Tony Soprano', 'Michael Corleone', 'Al Capone', 'Lucky Luciano',
  'Carlo Gambino', 'John Gotti', 'Pablo Escobar', 'Frank Costello', 'Salvatore Maranzano',
  'Joe Masseria', 'Meyer Lansky', 'Bugsy Siegel', 'Dutch Schultz', 'Whitey Bulger',
  'Bumpy Johnson', 'Raymond Patriarca', 'Carlos Marcello', 'Sam Giancana', 'Nicky Scarfo',
];

const CITIES = ['New York', 'Chicago', 'Los Angeles', 'Miami', 'Las Vegas'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
  try {
    // Check if bots already exist
    const existingBots = await db.player.count({ where: { isBot: true } });
    if (existingBots > 0) {
      return NextResponse.json({ message: `${existingBots} bots already exist` });
    }

    const tieredStats = [
      // Tier 1 (top 5): Strong bots
      { ops: [50, 80], soldiers: [40, 70], cash: [500000, 1500000], bank: [200000, 800000], glocks: [30, 60], shotguns: [15, 30], uzis: [10, 20], ak47s: [5, 15], alcohol: [200, 500], weed: [100, 300], coke: [50, 150], chryslers: [5, 10], limos: [2, 5], gulfstreams: [1, 3], boeings: [0, 1] },
      // Tier 2 (5-10): Medium bots
      { ops: [25, 50], soldiers: [20, 40], cash: [100000, 500000], bank: [50000, 200000], glocks: [15, 30], shotguns: [8, 15], uzis: [5, 10], ak47s: [2, 8], alcohol: [100, 200], weed: [50, 100], coke: [25, 75], chryslers: [2, 5], limos: [1, 2], gulfstreams: [0, 1], boeings: [0, 0] },
      // Tier 3 (10-15): Low-medium bots
      { ops: [10, 25], soldiers: [8, 20], cash: [20000, 100000], bank: [10000, 50000], glocks: [5, 15], shotguns: [3, 8], uzis: [1, 5], ak47s: [0, 3], alcohol: [50, 100], weed: [25, 50], coke: [10, 30], chryslers: [1, 3], limos: [0, 1], gulfstreams: [0, 0], boeings: [0, 0] },
      // Tier 4 (15-20): Weak bots
      { ops: [2, 10], soldiers: [2, 8], cash: [5000, 20000], bank: [0, 10000], glocks: [1, 5], shotguns: [0, 3], uzis: [0, 2], ak47s: [0, 1], alcohol: [10, 50], weed: [5, 25], coke: [0, 10], chryslers: [0, 1], limos: [0, 0], gulfstreams: [0, 0], boeings: [0, 0] },
    ];

    for (let i = 0; i < BOT_NAMES.length; i++) {
      const tier = tieredStats[Math.floor(i / 5)];
      const city = CITIES[i % CITIES.length];

      await db.player.create({
        data: {
          username: BOT_NAMES[i],
          passwordHash: await bcrypt.hash('bot123', 10),
          isBot: true,
          cash: rand(tier.cash[0], tier.cash[1]),
          bank: rand(tier.bank[0], tier.bank[1]),
          turns: rand(200, 500),
          operatives: rand(tier.ops[0], tier.ops[1]),
          soldiers: rand(tier.soldiers[0], tier.soldiers[1]),
          glocks: rand(tier.glocks[0], tier.glocks[1]),
          shotguns: rand(tier.shotguns[0], tier.shotguns[1]),
          uzis: rand(tier.uzis[0], tier.uzis[1]),
          ak47s: rand(tier.ak47s[0], tier.ak47s[1]),
          alcohol: rand(tier.alcohol[0], tier.alcohol[1]),
          weed: rand(tier.weed[0], tier.weed[1]),
          coke: rand(tier.coke[0], tier.coke[1]),
          chryslers: rand(tier.chryslers[0], tier.chryslers[1]),
          limos: rand(tier.limos[0], tier.limos[1]),
          gulfstreams: rand(tier.gulfstreams[0], tier.gulfstreams[1]),
          boeings: rand(tier.boeings[0], tier.boeings[1]),
          city,
        },
      });
    }

    return NextResponse.json({ message: `Seeded ${BOT_NAMES.length} bot opponents` });
  } catch (err) {
    console.error('Seed bots error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
