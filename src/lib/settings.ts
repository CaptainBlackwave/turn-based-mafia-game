// Round Settings System
// All configurable game settings per round

export interface RoundSettings {
  // Starting Values
  startingTurns: { Free: number; Titanium: number; Diamond: number; Onyx: number };
  startingReserves: { Free: number; Titanium: number; Diamond: number; Onyx: number };
  
  // Game Rules
  maxTurns: { Free: number; Titanium: number; Diamond: number; Onyx: number };
  regenPer10min: { Free: number; Titanium: number; Diamond: number; Onyx: number };
  roundCreditCap: number;
  dailyCreditCap: number;
  bankingPercentOfNW: number;
  maxingPercentPerHour: number;
  turnsPerCreditRedeemed: number;
  
  // Union & Ranks
  unionRanksEnabled: boolean;
  transfersEnabled: boolean; // true = family & union only, false = off
  
  // Attack Range
  rangeAboveMultiplier: number;  // 0 = OFF
  rangeBelowMultiplier: number;  // 0 = OFF
  
  // Combat: Bank Attacks
  personalBankStealPct: number;   // 0-1
  familyBankStealPct: number;
  unionBankStealPct: number;
  
  // Bots
  botsAutoAcceptFamilyInvites: boolean;
  botClassA: BotClassSettings;
  botClassB: BotClassSettings;
  botClassC: BotClassSettings;
  botClassD: BotClassSettings;
  
  // Gambling
  gambling: {
    coinFlip: { maxBet: number; maxBetsPerDay: number };
    blackjack: { maxBet: number };
    roulette: { maxBet: number; maxBetsPerDay: number };
    horseRace: { maxBet: number; maxBetsPerDay: number };
  };
}

export interface BotClassSettings {
  operativesReset: number;
  soldiersReset: number;
  weaponsReset: number;
  foodReset: number;
  cashOnHandReset: number;
  // Tier 2 values (higher power mode)
  operativesResetHigh: number;
  soldiersResetHigh: number;
  weaponsResetHigh: number;
  foodResetHigh: number;
  cashOnHandResetHigh: number;
}

export type SubscriptionTier = 'Free' | 'Titanium' | 'Diamond' | 'Onyx';

export const DEFAULT_ROUND_SETTINGS: RoundSettings = {
  // Starting Values
  startingTurns: { Free: 2500, Titanium: 5000, Diamond: 10000, Onyx: 20000 },
  startingReserves: { Free: 5000, Titanium: 5000, Diamond: 5000, Onyx: 5000 },
  
  // Game Rules
  maxTurns: { Free: 2500, Titanium: 5000, Diamond: 10000, Onyx: 20000 },
  regenPer10min: { Free: 25, Titanium: 50, Diamond: 100, Onyx: 200 },
  roundCreditCap: 999999999,
  dailyCreditCap: 999999999,
  bankingPercentOfNW: 75,
  maxingPercentPerHour: 75,
  turnsPerCreditRedeemed: 1,
  
  // Union & Ranks
  unionRanksEnabled: true,
  transfersEnabled: true,
  
  // Attack Range
  rangeAboveMultiplier: 4,
  rangeBelowMultiplier: 2,
  
  // Combat: Bank Attacks
  personalBankStealPct: 0.2,
  familyBankStealPct: 0.15,
  unionBankStealPct: 0.1,
  
  // Bots
  botsAutoAcceptFamilyInvites: true,
  botClassA: {
    operativesReset: 5990, soldiersReset: 3744, weaponsReset: 3744,
    foodReset: 1000000, cashOnHandReset: 6047518793,
    operativesResetHigh: 59900, soldiersResetHigh: 37440, weaponsResetHigh: 37440,
    foodResetHigh: 10000000, cashOnHandResetHigh: 604751879300,
  },
  botClassB: {
    operativesReset: 3114, soldiersReset: 1946, weaponsReset: 1946,
    foodReset: 1000000, cashOnHandReset: 1577870419,
    operativesResetHigh: 31140, soldiersResetHigh: 19460, weaponsResetHigh: 19460,
    foodResetHigh: 10000000, cashOnHandResetHigh: 157787041900,
  },
  botClassC: {
    operativesReset: 1676, soldiersReset: 1048, weaponsReset: 1048,
    foodReset: 1000000, cashOnHandReset: 426875911,
    operativesResetHigh: 16760, soldiersResetHigh: 10480, weaponsResetHigh: 10480,
    foodResetHigh: 10000000, cashOnHandResetHigh: 42687591100,
  },
  botClassD: {
    operativesReset: 957, soldiersReset: 598, weaponsReset: 598,
    foodReset: 1000000, cashOnHandReset: 122336078,
    operativesResetHigh: 9570, soldiersResetHigh: 5980, weaponsResetHigh: 5980,
    foodResetHigh: 10000000, cashOnHandResetHigh: 12233607800,
  },
  
  // Gambling
  gambling: {
    coinFlip: { maxBet: 1000000000000, maxBetsPerDay: 10 },
    blackjack: { maxBet: 10000000000 },
    roulette: { maxBet: 10000000000, maxBetsPerDay: 250 },
    horseRace: { maxBet: 1000000000000, maxBetsPerDay: 5 },
  },
};

export function getTieredValue<T extends Record<SubscriptionTier, number>>(
  settings: T,
  tier: SubscriptionTier
): number {
  return settings[tier] || settings['Free'];
}

export function serializeSettings(settings: RoundSettings): string {
  return JSON.stringify(settings);
}

export function deserializeSettings(json: string): RoundSettings {
  return { ...DEFAULT_ROUND_SETTINGS, ...JSON.parse(json) };
}
