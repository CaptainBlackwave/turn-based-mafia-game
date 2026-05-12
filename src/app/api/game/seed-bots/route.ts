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
      { ops: [50, 80], soldiers: [40, 70], cash: [500000, 1500000], bank: [200000, 800000], food: [300, 600], weapons: [50, 100], cars: [8, 15], planes: [2, 5] },
      // Tier 2 (5-10): Medium bots
      { ops: [25, 50], soldiers: [20, 40], cash: [100000, 500000], bank: [50000, 200000], food: [150, 300], weapons: [25, 50], cars: [4, 8], planes: [1, 2] },
      // Tier 3 (10-15): Low-medium bots
      { ops: [10, 25], soldiers: [8, 20], cash: [20000, 100000], bank: [10000, 50000], food: [50, 150], weapons: [10, 25], cars: [2, 4], planes: [0, 1] },
      // Tier 4 (15-20): Weak bots
      { ops: [2, 10], soldiers: [2, 8], cash: [5000, 20000], bank: [0, 10000], food: [10, 50], weapons: [2, 10], cars: [0, 2], planes: [0, 0] },
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
          food: rand(tier.food[0], tier.food[1]),
          weapons: rand(tier.weapons[0], tier.weapons[1]),
          cars: rand(tier.cars[0], tier.cars[1]),
          planes: rand(tier.planes[0], tier.planes[1]),
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
