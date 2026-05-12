import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deserializeSettings } from '@/lib/settings';
import { calculateNetworth, calculateCombatPower } from '@/lib/game-engine';
import bcrypt from 'bcryptjs';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// POST /api/bot-tick - Run bot AI actions (called by cron or admin)
export async function POST() {
  try {
    const bots = await db.player.findMany({
      where: { isBot: true },
      include: { family: true },
    });

    if (bots.length === 0) {
      return NextResponse.json({ message: 'No bots to run', actions: [] });
    }

    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;
    const actions: string[] = [];

    for (const bot of bots) {
      // Bots have unlimited turns for AI actions
      // Each bot gets a few random actions per tick

      // 1. COLLECT INCOME (if has operatives)
      if (bot.operatives > 0) {
        const collectTurns = Math.min(rand(1, 5), bot.turns);
        if (collectTurns > 0) {
          const collected = 200 * bot.operatives * collectTurns;
          await db.player.update({
            where: { id: bot.id },
            data: { cash: { increment: collected } },
          });
          actions.push(`${bot.username} collected ${collected.toLocaleString()} cash`);
        }
      }

      // 2. BUY SUPPLIES (food, weapons)
      if (bot.operatives > 0) {
        const foodNeeded = Math.max(0, bot.operatives - bot.food);
        if (foodNeeded > 0) {
          const buyAmount = Math.min(foodNeeded, rand(100, 500));
          const cost = buyAmount * 50;
          if (bot.cash >= cost) {
            await db.player.update({
              where: { id: bot.id },
              data: { cash: { decrement: cost }, food: { increment: buyAmount } },
            });
            actions.push(`${bot.username} bought ${buyAmount} food`);
          }
        }
      }

      if (bot.soldiers > 0) {
        const weaponsNeeded = Math.max(0, bot.soldiers - bot.weapons);
        if (weaponsNeeded > 0) {
          const buyAmount = Math.min(weaponsNeeded, rand(10, 100));
          const cost = buyAmount * 1000;
          if (bot.cash >= cost) {
            await db.player.update({
              where: { id: bot.id },
              data: { cash: { decrement: cost }, weapons: { increment: buyAmount } },
            });
            actions.push(`${bot.username} bought ${buyAmount} weapons`);
          }
        }
      }

      // 3. HIRE UNITS
      if (Math.random() < 0.3) {
        const hireType = Math.random() < 0.5 ? 'operatives' : 'soldiers';
        const hireAmount = rand(1, 10);
        await db.player.update({
          where: { id: bot.id },
          data: { [hireType]: { increment: hireAmount } },
        });
        actions.push(`${bot.username} hired ${hireAmount} ${hireType}`);
      }

      // 4. BANK SOME CASH
      if (bot.cash > 100000 && Math.random() < 0.4) {
        const depositAmount = Math.floor(bot.cash * (rand(20, 60) / 100));
        await db.player.update({
          where: { id: bot.id },
          data: { cash: { decrement: depositAmount }, bank: { increment: depositAmount } },
        });
        actions.push(`${bot.username} deposited ${depositAmount.toLocaleString()}`);
      }

      // 5. ATTACK RANDOM TARGET (if has soldiers)
      if (bot.soldiers > 5 && Math.random() < 0.2) {
        const botNW = calculateNetworth(bot);
        const targets = await db.player.findMany({
          where: {
            id: { not: bot.id },
            isBot: false,
            city: bot.city,
            protectedUntil: { or: [null, { lt: new Date() }] },
          },
        });

        // Find target in range
        const validTargets = targets.filter(t => {
          const tNW = calculateNetworth(t);
          if (tNW <= 0 || botNW <= 0) return false;
          const rangeAbove = settings?.rangeAboveMultiplier ?? 4;
          const rangeBelow = settings?.rangeBelowMultiplier ?? 2;
          if (rangeAbove === 0 || rangeBelow === 0) return true;
          const minRange = botNW * (1 / rangeAbove);
          const maxRange = botNW * rangeBelow;
          return tNW >= minRange && tNW <= maxRange;
        });

        if (validTargets.length > 0) {
          const target = validTargets[rand(0, validTargets.length - 1)];
          const attackTypes = ['raid', 'sabotage', 'driveby'] as const;
          const attackType = attackTypes[rand(0, 2)];

          const botPower = calculateCombatPower({ soldiers: bot.soldiers, weapons: bot.weapons });
          const targetPower = calculateCombatPower({ soldiers: target.soldiers, weapons: target.weapons });
          const botRandom = 0.8 + Math.random() * 0.4;
          const targetRandom = 0.8 + Math.random() * 0.4;
          const won = botPower * botRandom > targetPower * targetRandom;

          let cashStolen = 0;
          let foodStolen = 0;
          let weaponsStolen = 0;
          let opsKilled = 0;
          let soldiersKilled = 0;
          let attackerLosses = 0;

          if (won) {
            const intensity = Math.min((bot.soldiers + target.soldiers) / 100, 0.5) + 0.05;

            if (attackType === 'raid') {
              cashStolen = Math.floor(target.cash * (0.08 + Math.random() * 0.17));
              soldiersKilled = Math.ceil(target.soldiers * intensity * (0.5 + Math.random() * 0.5));
              opsKilled = Math.ceil(target.operatives * (0.05 + Math.random() * 0.1));
            } else if (attackType === 'sabotage') {
              foodStolen = Math.floor(target.food * (0.1 + Math.random() * 0.15));
              weaponsStolen = Math.floor(target.weapons * (0.1 + Math.random() * 0.15));
              soldiersKilled = Math.ceil(target.soldiers * intensity * (0.5 + Math.random() * 0.5));
            } else {
              soldiersKilled = Math.ceil(target.soldiers * intensity * (0.5 + Math.random() * 0.5));
            }
            attackerLosses = Math.ceil(bot.soldiers * intensity * 0.1 * Math.random());
          } else {
            attackerLosses = Math.ceil(bot.soldiers * intensity * (0.5 + Math.random() * 0.5));
            soldiersKilled = Math.ceil(target.soldiers * intensity * 0.1 * Math.random());
          }

          await db.attack.create({
            data: {
              attackerId: bot.id,
              defenderId: target.id,
              type: attackType,
              success: won,
              cashStolen,
              foodStolen,
              weaponsStolen,
              opsKilled,
              soldiersKilled,
            },
          });

          // Update both players
          const botUpdates: any = { soldiers: { decrement: attackerLosses } };
          if (cashStolen > 0) botUpdates.cash = { increment: cashStolen };
          if (foodStolen > 0) botUpdates.food = { increment: foodStolen };
          if (weaponsStolen > 0) botUpdates.weapons = { increment: weaponsStolen };

          const targetUpdates: any = { soldiers: { decrement: soldiersKilled } };
          if (opsKilled > 0) targetUpdates.operatives = { decrement: opsKilled };
          if (cashStolen > 0) targetUpdates.cash = { decrement: cashStolen };
          if (foodStolen > 0) targetUpdates.food = { decrement: Math.min(foodStolen, target.food) };
          if (weaponsStolen > 0) targetUpdates.weapons = { decrement: Math.min(weaponsStolen, target.weapons) };

          await db.player.update({ where: { id: bot.id }, data: botUpdates });
          await db.player.update({ where: { id: target.id }, data: targetUpdates });

          actions.push(`${bot.username} ${won ? 'won' : 'lost'} ${attackType} vs ${target.username}`);
        }
      }

      // 6. TRAVEL (random city change)
      if (Math.random() < 0.1) {
        const cities = ['New York', 'Chicago', 'Los Angeles', 'Miami', 'Las Vegas'];
        const newCity = cities[rand(0, cities.length - 1)];
        if (newCity !== bot.city) {
          await db.player.update({
            where: { id: bot.id },
            data: { city: newCity },
          });
          actions.push(`${bot.username} traveled to ${newCity}`);
        }
      }

      // 7. AUTO-ACCEPT FAMILY INVITES
      if (settings?.botsAutoAcceptFamilyInvites && !bot.familyId && Math.random() < 0.1) {
        const families = await db.family.findMany({
          where: { city: bot.city },
          take: 5,
        });
        if (families.length > 0) {
          const fam = families[rand(0, families.length - 1)];
          await db.player.update({
            where: { id: bot.id },
            data: { familyId: fam.id },
          });
          actions.push(`${bot.username} joined family "${fam.name}"`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      botsProcessed: bots.length,
      actions,
    });
  } catch (err) {
    console.error('Bot tick error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
