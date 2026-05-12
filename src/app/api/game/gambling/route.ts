import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { deserializeSettings } from '@/lib/settings';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Blackjack hand value
function blackjackValue(hand: number[]): number {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (card === 1) { aces++; value += 11; }
    else if (card >= 10) value += 10;
    else value += card;
  }
  while (value > 21 && aces > 0) { value -= 10; aces--; }
  return value;
}

function drawCard(): number {
  return rand(1, 13); // 1=Ace, 2-10, 11=J, 12=Q, 13=K
}

// POST /api/game/gambling - All gambling games
export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gameType, betAmount, choice, action } = await req.json();
    if (!gameType || !betAmount || betAmount < 1) {
      return NextResponse.json({ error: 'Game type and bet required' }, { status: 400 });
    }

    if (player.cash < betAmount) {
      return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });
    }

    // Get settings
    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

    // Reset daily counters if needed
    const now = new Date();
    const lastReset = new Date(player.lastGambleReset);
    const isNewDay = lastReset.toDateString() !== now.toDateString();
    const updateData: any = {};
    if (isNewDay) {
      updateData.coinFlipsToday = 0;
      updateData.roulettesToday = 0;
      updateData.horseRacesToday = 0;
      updateData.lastGambleReset = now;
    }

    let payout = 0;
    let won = false;
    let details: any = {};

    if (gameType === 'coinflip') {
      const maxBet = settings?.gambling.coinFlip.maxBet ?? 1000000000000;
      const maxBets = settings?.gambling.coinFlip.maxBetsPerDay ?? 10;

      if (betAmount > maxBet) return NextResponse.json({ error: `Max bet is ${maxBet.toLocaleString()}` }, { status: 400 });
      const betsToday = isNewDay ? 0 : player.coinFlipsToday;
      if (betsToday >= maxBets) return NextResponse.json({ error: `Max ${maxBets} coin flips per day` }, { status: 400 });

      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      won = (choice === result);
      payout = won ? betAmount : -betAmount;
      details = { result, choice };

      updateData.coinFlipsToday = { increment: 1 };
    }

    else if (gameType === 'blackjack') {
      const maxBet = settings?.gambling.blackjack.maxBet ?? 10000000000;
      if (betAmount > maxBet) return NextResponse.json({ error: `Max bet is ${maxBet.toLocaleString()}` }, { status: 400 });

      if (action === 'start') {
        // Deal initial hands
        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];
        const playerVal = blackjackValue(playerHand);
        const dealerVal = blackjackValue(dealerHand);

        // Check for natural blackjack
        if (playerVal === 21 && dealerVal === 21) {
          payout = 0; // Push
          details = { playerHand, dealerHand, result: 'push' };
        } else if (playerVal === 21) {
          won = true;
          payout = Math.floor(betAmount * 1.5);
          details = { playerHand, dealerHand, result: 'blackjack' };
        } else {
          // Return hand state for player to hit/stand
          return NextResponse.json({
            success: true,
            gameType: 'blackjack',
            phase: 'playing',
            playerHand,
            dealerHand: [dealerHand[0]], // Only show first dealer card
            playerValue: playerVal,
            betAmount,
          });
        }
      }

      else if (action === 'hit') {
        const playerHand: number[] = choice; // Player sends current hand
        playerHand.push(drawCard());
        const playerVal = blackjackValue(playerHand);

        if (playerVal > 21) {
          won = false;
          payout = -betAmount;
          details = { playerHand, result: 'bust' };
        } else if (playerVal === 21) {
          // Auto-stand on 21
          won = false; // Dealer will play next request
          return NextResponse.json({
            success: true,
            gameType: 'blackjack',
            phase: 'stand',
            playerHand,
            playerValue: playerVal,
            betAmount,
          });
        } else {
          return NextResponse.json({
            success: true,
            gameType: 'blackjack',
            phase: 'playing',
            playerHand,
            playerValue: playerVal,
            betAmount,
          });
        }
      }

      else if (action === 'stand') {
        const playerHand: number[] = choice.playerHand;
        let dealerHand: number[] = choice.dealerHand;
        // Draw dealer cards
        while (blackjackValue(dealerHand) < 17) {
          dealerHand.push(drawCard());
        }
        const playerVal = blackjackValue(playerHand);
        const dealerVal = blackjackValue(dealerHand);

        if (dealerVal > 21) {
          won = true;
          payout = betAmount;
          details = { playerHand, dealerHand, result: 'dealer_bust' };
        } else if (playerVal > dealerVal) {
          won = true;
          payout = betAmount;
          details = { playerHand, dealerHand, result: 'win' };
        } else if (playerVal === dealerVal) {
          payout = 0;
          details = { playerHand, dealerHand, result: 'push' };
        } else {
          won = false;
          payout = -betAmount;
          details = { playerHand, dealerHand, result: 'lose' };
        }
      }
    }

    else if (gameType === 'roulette') {
      const maxBet = settings?.gambling.roulette.maxBet ?? 10000000000;
      const maxBets = settings?.gambling.roulette.maxBetsPerDay ?? 250;

      if (betAmount > maxBet) return NextResponse.json({ error: `Max bet is ${maxBet.toLocaleString()}` }, { status: 400 });
      const betsToday = isNewDay ? 0 : player.roulettesToday;
      if (betsToday >= maxBets) return NextResponse.json({ error: `Max ${maxBets} roulette bets per day` }, { status: 400 });

      // Simple roulette: number 0-36, red/black/green
      const spin = rand(0, 36);
      const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const spinColor = spin === 0 ? 'green' : redNumbers.includes(spin) ? 'red' : 'black';

      if (choice === 'green' && spin === 0) { won = true; payout = betAmount * 14; }
      else if (choice === 'red' && spinColor === 'red') { won = true; payout = betAmount; }
      else if (choice === 'black' && spinColor === 'black') { won = true; payout = betAmount; }
      else if (choice === 'odd' && spin > 0 && spin % 2 === 1) { won = true; payout = betAmount; }
      else if (choice === 'even' && spin > 0 && spin % 2 === 0) { won = true; payout = betAmount; }
      else { won = false; payout = -betAmount; }

      details = { spin, spinColor, choice };
      updateData.roulettesToday = { increment: 1 };
    }

    else if (gameType === 'horserace') {
      const maxBet = settings?.gambling.horseRace.maxBet ?? 1000000000000;
      const maxBets = settings?.gambling.horseRace.maxBetsPerDay ?? 5;

      if (betAmount > maxBet) return NextResponse.json({ error: `Max bet is ${maxBet.toLocaleString()}` }, { status: 400 });
      const betsToday = isNewDay ? 0 : player.horseRacesToday;
      if (betsToday >= maxBets) return NextResponse.json({ error: `Max ${maxBets} horse races per day` }, { status: 400 });

      // Horse race: 6 horses, each with odds
      const horses = [
        { name: 'Thunder Bolt', odds: 3 },
        { name: 'Midnight Star', odds: 5 },
        { name: 'Lucky Strike', odds: 8 },
        { name: 'Wild Fire', odds: 4 },
        { name: 'Shadow Runner', odds: 6 },
        { name: 'Gold Rush', odds: 10 },
      ];

      // Weighted random based on odds
      const totalOdds = horses.reduce((s, h) => s + h.odds, 0);
      let roll = rand(1, totalOdds);
      let winnerIdx = 0;
      for (let i = 0; i < horses.length; i++) {
        roll -= horses[i].odds;
        if (roll <= 0) { winnerIdx = i; break; }
      }

      const winner = horses[winnerIdx];
      const horseChoice = parseInt(choice); // 0-5
      if (horseChoice === winnerIdx) {
        won = true;
        payout = betAmount * winner.odds;
      } else {
        won = false;
        payout = -betAmount;
      }

      details = { horses, winner: winnerIdx, choice: horseChoice, winnerName: winner.name, odds: winner.odds };
      updateData.horseRacesToday = { increment: 1 };
    }

    else {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 });
    }

    // For blackjack mid-game responses, we already returned
    if (payout === 0 && !details.result) {
      return NextResponse.json({ success: true, phase: 'continue' });
    }

    // Update player cash
    updateData.cash = { increment: payout };

    await db.player.update({
      where: { id: player.id },
      data: updateData,
    });

    // Log gambling
    await db.gamblingLog.create({
      data: {
        playerId: player.id,
        gameType,
        betAmount,
        won,
        payout: Math.max(0, payout),
        details: JSON.stringify(details),
      },
    });

    const msg = won
      ? payout > betAmount * 2 ? `JACKPOT! Won ${payout.toLocaleString()}!` : `Won ${payout.toLocaleString()}!`
      : payout === 0 ? 'Push! Bet returned.' : `Lost ${Math.abs(payout).toLocaleString()}.`;

    return NextResponse.json({
      success: true,
      won,
      payout,
      message: msg,
      details,
    });
  } catch (err) {
    console.error('Gambling error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
