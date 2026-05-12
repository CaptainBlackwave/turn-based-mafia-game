import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { deserializeSettings } from '@/lib/settings';

// POST /api/game/credits - Buy credits (donation) or redeem credits for reserves/turns
export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount } = await req.json();
    if (!action || !amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get active round settings
    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

    if (action === 'buy_credits') {
      // Simulate a donation - in production, this would integrate with payment
      // For now, credits are granted directly (admin or self-purchase simulation)
      const dailyCap = settings?.dailyCreditCap ?? 999999999;
      const roundCap = settings?.roundCreditCap ?? 999999999;

      // Reset daily counter if new day
      const lastReset = new Date(player.lastCreditReset);
      const now = new Date();
      const isNewDay = lastReset.toDateString() !== now.toDateString();

      let newBoughtToday = player.creditsBoughtToday;
      let newUsedThisRound = player.creditsUsedThisRound;

      if (isNewDay) {
        newBoughtToday = 0;
      }

      if (newBoughtToday + amount > dailyCap) {
        return NextResponse.json({ error: `Daily credit cap reached (${dailyCap})` }, { status: 400 });
      }
      if (newUsedThisRound + amount > roundCap) {
        return NextResponse.json({ error: `Round credit cap reached (${roundCap})` }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: {
          credits: { increment: amount },
          creditsBoughtToday: isNewDay ? amount : { increment: amount },
          creditsUsedThisRound: { increment: amount },
          lastCreditReset: isNewDay ? now : undefined,
        },
      });

      await db.creditTransaction.create({
        data: {
          playerId: player.id,
          type: 'donation',
          amount,
          description: `Purchased ${amount} credits`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Purchased ${amount} credits`,
        credits: updated.credits,
      });
    }

    if (action === 'credits_to_reserves') {
      // Convert credits to reserves (turns not against cap)
      const turnsPerCredit = settings?.turnsPerCreditRedeemed ?? 1;
      const reserveAmount = amount * turnsPerCredit;

      if (player.credits < amount) {
        return NextResponse.json({ error: 'Not enough credits' }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: {
          credits: { decrement: amount },
          reserves: { increment: reserveAmount },
        },
      });

      await db.creditTransaction.create({
        data: {
          playerId: player.id,
          type: 'redeem_reserves',
          amount,
          description: `Converted ${amount} credits to ${reserveAmount} reserves`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Converted ${amount} credits to ${reserveAmount} reserves`,
        credits: updated.credits,
        reserves: updated.reserves,
      });
    }

    if (action === 'reserves_to_turns') {
      // Convert reserves to usable turns
      const tier = player.subscriptionTier as 'Free' | 'Titanium' | 'Diamond' | 'Onyx';
      const maxTurns = settings?.maxTurns[tier] ?? 500;
      const canRedeem = Math.max(0, maxTurns - player.turns);
      const actualAmount = Math.min(amount, player.reserves, canRedeem);

      if (actualAmount < 1) {
        return NextResponse.json({ error: 'No turns can be redeemed (at max or no reserves)' }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: {
          reserves: { decrement: actualAmount },
          turns: { increment: actualAmount },
        },
      });

      await db.creditTransaction.create({
        data: {
          playerId: player.id,
          type: 'redeem_turns',
          amount: actualAmount,
          description: `Converted ${actualAmount} reserves to turns`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Redeemed ${actualAmount} turns from reserves`,
        turns: updated.turns,
        reserves: updated.reserves,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Credits error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
