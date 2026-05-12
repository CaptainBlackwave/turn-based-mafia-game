import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/api-auth';
import { calculateNetworth, isInAttackRange, isMaxed, resolveAttack } from '@/lib/game-engine';
import { deserializeSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (player.turns < 1) {
      return NextResponse.json({ error: 'Not enough turns' }, { status: 400 });
    }

    if (player.protectedUntil && new Date(player.protectedUntil) > new Date()) {
      return NextResponse.json({ error: 'You are under protection' }, { status: 400 });
    }

    const { targetId, attackType } = await req.json();
    if (!targetId || !attackType) {
      return NextResponse.json({ error: 'Target and attack type required' }, { status: 400 });
    }

    // Get settings
    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

    const rangeAbove = settings?.rangeAboveMultiplier ?? 4;
    const rangeBelow = settings?.rangeBelowMultiplier ?? 2;
    const maxingPct = settings?.maxingPercentPerHour ?? 10;

    const target = await db.player.findUnique({
      where: { id: targetId },
      include: { family: true },
    });
    if (!target || target.id === player.id) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    if (target.city !== player.city) {
      return NextResponse.json({ error: 'Target is in a different city' }, { status: 400 });
    }

    // Attack range check
    const attackerNW = calculateNetworth(player);
    const defenderNW = calculateNetworth(target);
    if (!isInAttackRange(attackerNW, defenderNW, rangeAbove, rangeBelow)) {
      return NextResponse.json({ error: 'Target is out of your attack range' }, { status: 400 });
    }

    // Maxing check
    const recentAttacks = await db.attack.findMany({
      where: { attackerId: player.id, defenderId: target.id },
    });
    if (isMaxed(recentAttacks.map(a => ({ cashStolen: a.cashStolen, createdAt: a.createdAt })), defenderNW, new Date(), maxingPct)) {
      return NextResponse.json({ error: 'Target is already maxed for this hour' }, { status: 400 });
    }

    // Bank attack
    if (attackType === 'bank') {
      const stealPct = settings?.personalBankStealPct ?? 0.2;
      const result = resolveAttack(
        { soldiers: player.soldiers, weapons: player.weapons, cars: player.cars },
        { soldiers: target.soldiers, weapons: target.weapons, operatives: target.operatives },
        'raid'
      );

      if (!result.success) {
        await db.attack.create({
          data: {
            attackerId: player.id, defenderId: target.id, type: 'bank', success: false,
            soldiersKilled: result.attackerLosses,
          },
        });
        await db.player.update({
          where: { id: player.id },
          data: { turns: { decrement: 1 }, soldiers: { decrement: result.attackerLosses } },
        });
        return NextResponse.json({
          success: true, result: { won: false, attackerLosses: result.attackerLosses, defenderLosses: 0 },
          message: `Bank attack failed! Lost ${result.attackerLosses} soldiers`,
        });
      }

      const bankStolen = Math.floor(target.bank * stealPct);
      await db.attack.create({
        data: {
          attackerId: player.id, defenderId: target.id, type: 'bank', success: true,
          bankStolen, soldiersKilled: result.defenderLosses,
        },
      });

      await db.player.update({
        where: { id: player.id },
        data: { turns: { decrement: 1 }, soldiers: { decrement: result.attackerLosses }, cash: { increment: bankStolen } },
      });
      await db.player.update({
        where: { id: target.id },
        data: { bank: { decrement: bankStolen }, soldiers: { decrement: result.defenderLosses } },
      });

      return NextResponse.json({
        success: true,
        result: { won: true, attackerLosses: result.attackerLosses, defenderLosses: result.defenderLosses, bankStolen },
        message: `Bank raid successful! Stole ${bankStolen.toLocaleString()} from bank`,
      });
    }

    // Regular attacks
    const result = resolveAttack(
      { soldiers: player.soldiers, weapons: player.weapons, cars: player.cars },
      { soldiers: target.soldiers, weapons: target.weapons, operatives: target.operatives },
      attackType as 'raid' | 'sabotage' | 'driveby'
    );

    if (attackType === 'driveby' && result.attackerLosses === 0 && result.defenderLosses === 0) {
      return NextResponse.json({ error: 'You need cars for a drive-by' }, { status: 400 });
    }

    let cashStolen = 0;
    let weaponsStolen = 0;
    let foodStolen = 0;
    let opsKilled = 0;

    if (result.success) {
      switch (attackType) {
        case 'raid':
          cashStolen = Math.floor(target.cash * (0.08 + Math.random() * 0.17));
          result.defenderLosses = Math.max(result.defenderLosses, Math.ceil(target.soldiers * (0.10 + Math.random() * 0.15)));
          opsKilled = Math.ceil(target.operatives * (0.05 + Math.random() * 0.10));
          break;
        case 'sabotage':
          foodStolen = Math.floor(target.food * (0.10 + Math.random() * 0.15));
          weaponsStolen = Math.floor(target.weapons * (0.10 + Math.random() * 0.15));
          result.defenderLosses = Math.max(result.defenderLosses, Math.ceil(target.soldiers * (0.08 + Math.random() * 0.12)));
          break;
        case 'driveby':
          break;
      }
    }

    await db.attack.create({
      data: {
        attackerId: player.id, defenderId: target.id, type: attackType, success: result.success,
        cashStolen, opsKilled, soldiersKilled: result.defenderLosses, weaponsStolen, foodStolen,
      },
    });

    const attackerUpdates: any = { turns: { decrement: 1 }, soldiers: { decrement: result.attackerLosses } };
    if (cashStolen > 0) attackerUpdates.cash = { increment: cashStolen };
    if (weaponsStolen > 0) attackerUpdates.weapons = { increment: weaponsStolen };
    if (foodStolen > 0) attackerUpdates.food = { increment: foodStolen };

    const updatedAttacker = await db.player.update({ where: { id: player.id }, data: attackerUpdates });

    const defenderUpdates: any = { soldiers: { decrement: result.defenderLosses } };
    if (cashStolen > 0) defenderUpdates.cash = { decrement: cashStolen };
    if (opsKilled > 0) defenderUpdates.operatives = { decrement: opsKilled };
    if (weaponsStolen > 0) defenderUpdates.weapons = { decrement: Math.min(weaponsStolen, target.weapons) };
    if (foodStolen > 0) defenderUpdates.food = { decrement: Math.min(foodStolen, target.food) };

    await db.player.update({ where: { id: target.id }, data: defenderUpdates });

    return NextResponse.json({
      success: true,
      result: {
        won: result.success, attackType, attackerLosses: result.attackerLosses, defenderLosses: result.defenderLosses,
        cashStolen, weaponsStolen, foodStolen, opsKilled,
      },
      message: result.success
        ? `Attack successful! Killed ${result.defenderLosses} soldiers${opsKilled > 0 ? `, ${opsKilled} operatives` : ''}${cashStolen > 0 ? `, stole ${cashStolen.toLocaleString()}` : ''}${foodStolen > 0 ? `, ${foodStolen} food` : ''}${weaponsStolen > 0 ? `, ${weaponsStolen} weapons` : ''}`
        : `Attack failed! Lost ${result.attackerLosses} soldiers`,
    });
  } catch (err) {
    console.error('Attack error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
