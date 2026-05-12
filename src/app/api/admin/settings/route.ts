import { NextResponse } from 'next/server';
import { getAdminSession, adminOnly } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { deserializeSettings } from '@/lib/settings';

// GET /api/admin/settings - Get current active round settings
export async function GET() {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    if (!activeRound) {
      // Return defaults if no active round
      const { DEFAULT_ROUND_SETTINGS } = await import('@/lib/settings');
      return NextResponse.json({ settings: DEFAULT_ROUND_SETTINGS, roundId: null, roundName: 'No Active Round' });
    }

    return NextResponse.json({
      settings: deserializeSettings(activeRound.settings),
      roundId: activeRound.id,
      roundName: activeRound.name,
      roundNumber: activeRound.number,
    });
  } catch (err) {
    console.error('Admin settings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
