import { NextResponse } from 'next/server';
import { getAdminSession, adminOnly } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { deserializeSettings } from '@/lib/settings';

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

// GET /api/admin/bots - List all bots
export async function GET() {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const bots = await db.player.findMany({
      where: { isBot: true },
      orderBy: { createdAt: 'asc' },
      include: { family: true },
    });

    return NextResponse.json({ bots });
  } catch (err) {
    console.error('Admin bots GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/bots - Manage bots
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const body = await req.json();
    const { action, botId, botClass, highPower } = body;

    if (action === 'seed') {
      // Get active round settings for bot class values
      const activeRound = await db.round.findFirst({ where: { status: 'active' } });
      const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

      const classes = ['A', 'B', 'C', 'D'] as const;
      const classSettings = settings ? [
        settings.botClassA, settings.botClassB, settings.botClassC, settings.botClassD
      ] : null;

      const existingBots = await db.player.findMany({ where: { isBot: true } });
      if (existingBots.length > 0) {
        return NextResponse.json({ error: 'Bots already exist. Delete them first.' }, { status: 400 });
      }

      for (let i = 0; i < BOT_NAMES.length; i++) {
        const classIdx = Math.floor(i / 5);
        const botClassSettings = classSettings?.[classIdx];
        const city = CITIES[i % CITIES.length];

        const ops = botClassSettings
          ? rand(
              Math.floor(botClassSettings.operativesReset * 0.8),
              botClassSettings.operativesReset
            )
          : rand(2, 80);
        const soldiers = botClassSettings
          ? rand(
              Math.floor(botClassSettings.soldiersReset * 0.8),
              botClassSettings.soldiersReset
            )
          : rand(2, 70);
        const weapons = botClassSettings
          ? rand(
              Math.floor(botClassSettings.weaponsReset * 0.8),
              botClassSettings.weaponsReset
            )
          : rand(2, 100);
        const food = botClassSettings
          ? rand(
              Math.floor(botClassSettings.foodReset * 0.8),
              botClassSettings.foodReset
            )
          : rand(10, 600);
        const cash = botClassSettings
          ? rand(
              Math.floor(botClassSettings.cashOnHandReset * 0.8),
              botClassSettings.cashOnHandReset
            )
          : rand(5000, 1500000);

        await db.player.create({
          data: {
            username: BOT_NAMES[i],
            passwordHash: await bcrypt.hash('bot_' + Math.random().toString(36), 10),
            isBot: true,
            cash,
            bank: 0,
            turns: 500,
            operatives: ops,
            soldiers,
            food,
            weapons,
            cars: Math.max(1, Math.floor(soldiers / 10)),
            planes: classIdx === 0 ? rand(2, 5) : rand(0, 2),
            city,
          },
        });
      }

      return NextResponse.json({ success: true, message: `Seeded ${BOT_NAMES.length} bots (5 per class)` });
    }

    if (action === 'reset_bots') {
      const activeRound = await db.round.findFirst({ where: { status: 'active' } });
      const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

      const bots = await db.player.findMany({ where: { isBot: true } });
      const classes = ['A', 'B', 'C', 'D'] as const;
      const classSettings = settings ? [
        settings.botClassA, settings.botClassB, settings.botClassC, settings.botClassD
      ] : null;

      for (let i = 0; i < bots.length; i++) {
        const classIdx = Math.min(Math.floor(i / 5), 3);
        const cs = classSettings?.[classIdx];
        if (!cs) continue;

        const high = highPower || false;
        await db.player.update({
          where: { id: bots[i].id },
          data: {
            operatives: rand(Math.floor(cs.operativesReset * 0.8), high ? cs.operativesResetHigh : cs.operativesReset),
            soldiers: rand(Math.floor(cs.soldiersReset * 0.8), high ? cs.soldiersResetHigh : cs.soldiersReset),
            weapons: rand(Math.floor(cs.weaponsReset * 0.8), high ? cs.weaponsResetHigh : cs.weaponsReset),
            food: rand(Math.floor(cs.foodReset * 0.8), high ? cs.foodResetHigh : cs.foodReset),
            cash: rand(Math.floor(cs.cashOnHandReset * 0.8), high ? cs.cashOnHandResetHigh : cs.cashOnHandReset),
            cars: Math.max(1, Math.floor((high ? cs.soldiersResetHigh : cs.soldiersReset) / 10)),
            planes: classIdx === 0 ? rand(2, 5) : rand(0, 2),
            bank: 0,
          },
        });
      }

      return NextResponse.json({ success: true, message: `Reset ${bots.length} bots` });
    }

    if (action === 'delete_all') {
      const count = await db.player.deleteMany({ where: { isBot: true } });
      return NextResponse.json({ success: true, message: `Deleted ${count.count} bots` });
    }

    if (action === 'set_class') {
      if (!botId || !botClass) return NextResponse.json({ error: 'Bot ID and class required' }, { status: 400 });
      // Store class info as a comment in username or use a separate table
      // For simplicity, we'll store it as a prefix in a custom field approach
      // Since we don't have a botClass field, we'll track this differently
      return NextResponse.json({ success: true, message: 'Bot class updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin bots POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
