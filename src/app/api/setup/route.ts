import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { serializeSettings, DEFAULT_ROUND_SETTINGS } from '@/lib/settings';

// GET /api/setup - Initialize game with admin account and default round
export async function GET() {
  try {
    const adminExists = await db.player.findFirst({ where: { isAdmin: true } });
    if (!adminExists) {
      await db.player.create({
        data: {
          username: 'admin',
          passwordHash: await bcrypt.hash('admin123', 10),
          isAdmin: true,
          cash: 0,
          turns: 99999,
        },
      });
    }

    const roundCount = await db.round.count();
    if (roundCount === 0) {
      await db.round.create({
        data: {
          number: 1,
          name: 'Round 1 - Opening',
          status: 'active',
          startedAt: new Date(),
          settings: serializeSettings(DEFAULT_ROUND_SETTINGS),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Game initialized' });
  } catch (err) {
    console.error('Setup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
