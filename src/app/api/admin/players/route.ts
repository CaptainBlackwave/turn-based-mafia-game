import { NextResponse } from 'next/server';
import { getAdminSession, adminOnly } from '@/lib/admin-auth';
import { db } from '@/lib/db';

// GET /api/admin/players - List all players
export async function GET(req: Request) {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.username = { contains: search };
    }

    const players = await db.player.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { family: true },
    });

    const { calculateNetworth } = await import('@/lib/game-engine');
    const playersWithNW = players.map(p => ({
      ...p,
      networth: calculateNetworth(p),
    }));

    return NextResponse.json({ players: playersWithNW });
  } catch (err) {
    console.error('Admin players GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/players - Admin actions on players
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    const err = adminOnly(admin);
    if (err) return err;

    const body = await req.json();
    const { action, playerId, data } = body;

    if (action === 'set_admin') {
      await db.player.update({
        where: { id: playerId },
        data: { isAdmin: data.isAdmin },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'set_tier') {
      await db.player.update({
        where: { id: playerId },
        data: { subscriptionTier: data.tier },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'grant_credits') {
      const amount = data.amount || 0;
      await db.player.update({
        where: { id: playerId },
        data: { credits: { increment: amount } },
      });
      await db.creditTransaction.create({
        data: {
          playerId,
          type: 'admin_grant',
          amount,
          description: `Admin granted ${amount} credits`,
        },
      });
      return NextResponse.json({ success: true, message: `Granted ${amount} credits` });
    }

    if (action === 'grant_turns') {
      const amount = data.amount || 0;
      await db.player.update({
        where: { id: playerId },
        data: { turns: { increment: amount } },
      });
      return NextResponse.json({ success: true, message: `Granted ${amount} turns` });
    }

    if (action === 'grant_reserves') {
      const amount = data.amount || 0;
      await db.player.update({
        where: { id: playerId },
        data: { reserves: { increment: amount } },
      });
      return NextResponse.json({ success: true, message: `Granted ${amount} reserves` });
    }

    if (action === 'delete_player') {
      await db.player.delete({ where: { id: playerId } });
      return NextResponse.json({ success: true, message: 'Player deleted' });
    }

    if (action === 'ban') {
      await db.session.deleteMany({ where: { playerId } });
      return NextResponse.json({ success: true, message: 'Player sessions cleared (soft ban)' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin players POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
