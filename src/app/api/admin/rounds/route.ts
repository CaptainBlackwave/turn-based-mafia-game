import { NextResponse } from 'next/server';
import { getAdminSession, adminOnly } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { serializeSettings, deserializeSettings, DEFAULT_ROUND_SETTINGS } from '@/lib/settings';

// GET /api/admin/rounds - List all rounds
export async function GET() {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const rounds = await db.round.findMany({
      orderBy: { number: 'desc' },
    });

    return NextResponse.json({ rounds: rounds.map(r => ({
      id: r.id,
      number: r.number,
      name: r.name,
      status: r.status,
      startedAt: r.startedAt?.toISOString() ?? null,
      endedAt: r.endedAt?.toISOString() ?? null,
      settings: deserializeSettings(r.settings),
    }))});
  } catch (err) {
    console.error('Admin rounds GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/rounds - Create or update round
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const body = await req.json();
    const { action, roundId, name, settings } = body;

    if (action === 'create') {
      // Count existing rounds
      const count = await db.round.count();
      const round = await db.round.create({
        data: {
          number: count + 1,
          name: name || `Round ${count + 1}`,
          settings: serializeSettings(settings || DEFAULT_ROUND_SETTINGS),
          status: 'upcoming',
        },
      });
      return NextResponse.json({ success: true, round });
    }

    if (action === 'update_settings') {
      if (!roundId) return NextResponse.json({ error: 'Round ID required' }, { status: 400 });
      const round = await db.round.update({
        where: { id: roundId },
        data: { settings: serializeSettings(settings || DEFAULT_ROUND_SETTINGS) },
      });
      return NextResponse.json({ success: true, round });
    }

    if (action === 'start') {
      if (!roundId) return NextResponse.json({ error: 'Round ID required' }, { status: 400 });
      // End any active rounds first
      await db.round.updateMany({
        where: { status: 'active' },
        data: { status: 'ended', endedAt: new Date() },
      });
      const round = await db.round.update({
        where: { id: roundId },
        data: { status: 'active', startedAt: new Date() },
      });
      return NextResponse.json({ success: true, round });
    }

    if (action === 'end') {
      if (!roundId) return NextResponse.json({ error: 'Round ID required' }, { status: 400 });
      const round = await db.round.update({
        where: { id: roundId },
        data: { status: 'ended', endedAt: new Date() },
      });
      return NextResponse.json({ success: true, round });
    }

    if (action === 'reset_players') {
      if (!roundId) return NextResponse.json({ error: 'Round ID required' }, { status: 400 });
      const round = await db.round.findUnique({ where: { id: roundId } });
      if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 400 });

      const roundSettings = deserializeSettings(round.settings);

      // Reset all non-admin, non-bot players
      const players = await db.player.findMany({
        where: { isAdmin: false },
      });

      for (const player of players) {
        const tier = player.subscriptionTier as 'Free' | 'Titanium' | 'Diamond' | 'Onyx';
        const startingTurns = roundSettings.startingTurns[tier];
        const startingReserves = roundSettings.startingReserves[tier];

        await db.player.update({
          where: { id: player.id },
          data: {
            cash: 5000,
            bank: 0,
            turns: startingTurns,
            reserves: startingReserves,
            operatives: 0,
            soldiers: 0,
            food: 0,
            weapons: 0,
            cars: 0,
            planes: 0,
            familyId: null,
            unionId: null,
            familyRank: 'member',
            unionRank: 'member',
            creditsUsedThisRound: 0,
            coinFlipsToday: 0,
            roulettesToday: 0,
            horseRacesToday: 0,
          },
        });
      }

      // Reset bots to class settings
      const bots = await db.player.findMany({ where: { isBot: true } });
      // Re-seed bots handled separately via admin/bots endpoint

      return NextResponse.json({ success: true, message: `Reset ${players.length} players` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin rounds POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
