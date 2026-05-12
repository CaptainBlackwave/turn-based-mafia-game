import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { deserializeSettings } from '@/lib/settings';

// POST /api/game/transfers - Send cash/items to other players
export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, targetId, type, amount, quantity } = await req.json();
    if (!action || !targetId || !type) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check if transfers are enabled
    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;
    const transfersEnabled = settings?.transfersEnabled ?? true;

    if (!transfersEnabled) {
      return NextResponse.json({ error: 'Transfers are disabled this round' }, { status: 400 });
    }

    const target = await db.player.findUnique({
      where: { id: targetId },
      include: { family: true, union: true },
    });

    if (!target || target.id === player.id) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    // Check transfer eligibility: must be in same family or union
    const inSameFamily = player.familyId && player.familyId === target.familyId;
    const inSameUnion = player.unionId && player.unionId === target.unionId;

    if (!inSameFamily && !inSameUnion) {
      return NextResponse.json({ error: 'Can only transfer to family or union members' }, { status: 400 });
    }

    if (action === 'send') {
      if (type === 'cash') {
        if (!amount || amount < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        if (player.cash < amount) return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });

        await db.$transaction([
          db.player.update({ where: { id: player.id }, data: { cash: { decrement: amount } } }),
          db.player.update({ where: { id: targetId }, data: { cash: { increment: amount } } }),
          db.transfer.create({
            data: { fromId: player.id, toId: targetId, amount, type: 'cash' },
          }),
        ]);

        return NextResponse.json({ success: true, message: `Sent ${amount.toLocaleString()} cash to ${target.username}` });
      }

      if (type === 'food') {
        const qty = quantity || 0;
        if (qty < 1) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
        if (player.food < qty) return NextResponse.json({ error: 'Not enough food' }, { status: 400 });

        await db.$transaction([
          db.player.update({ where: { id: player.id }, data: { food: { decrement: qty } } }),
          db.player.update({ where: { id: targetId }, data: { food: { increment: qty } } }),
          db.transfer.create({
            data: { fromId: player.id, toId: targetId, amount: qty * 25, type: 'food', quantity: qty },
          }),
        ]);

        return NextResponse.json({ success: true, message: `Sent ${qty.toLocaleString()} food to ${target.username}` });
      }

      if (type === 'weapons') {
        const qty = quantity || 0;
        if (qty < 1) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
        if (player.weapons < qty) return NextResponse.json({ error: 'Not enough weapons' }, { status: 400 });

        await db.$transaction([
          db.player.update({ where: { id: player.id }, data: { weapons: { decrement: qty } } }),
          db.player.update({ where: { id: targetId }, data: { weapons: { increment: qty } } }),
          db.transfer.create({
            data: { fromId: player.id, toId: targetId, amount: qty * 500, type: 'weapons', quantity: qty },
          }),
        ]);

        return NextResponse.json({ success: true, message: `Sent ${qty.toLocaleString()} weapons to ${target.username}` });
      }
    }

    return NextResponse.json({ error: 'Invalid action or type' }, { status: 400 });
  } catch (err) {
    console.error('Transfer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/game/transfers - Get transfer history
export async function GET(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transfers = await db.transfer.findMany({
      where: {
        OR: [
          { fromId: player.id },
          { toId: player.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        from: { select: { id: true, username: true } },
        to: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ transfers });
  } catch (err) {
    console.error('Transfer GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
