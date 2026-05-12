// Game engine - all core game logic (settings-aware)

import { RoundSettings, getTieredValue, type SubscriptionTier } from './settings';

// ==================== NETWORTH ====================
export function calculateNetworth(player: {
  operatives: number;
  soldiers: number;
  food: number;
  weapons: number;
  cars: number;
  planes: number;
  cash: number;
  bank: number;
}): number {
  const unitNW = player.operatives * 1500 + player.soldiers * 600;
  const supplyNW = player.food * 3;
  const weaponNW = player.weapons * 1000;
  const vehicleNW = player.cars * 20000;
  const planeNW = player.planes * 100000;
  const financialNW = player.cash + player.bank;
  return unitNW + supplyNW + weaponNW + vehicleNW + planeNW + financialNW;
}

// ==================== HAPPINESS ====================
export function calculateOpHappiness(player: {
  operatives: number;
  soldiers: number;
  food: number;
}): number {
  if (player.operatives === 0) return 100;
  const foodSupply = Math.min(player.food / Math.max(player.operatives, 1), 1);
  const protectionRatio = Math.min(player.soldiers / Math.max(player.operatives * 0.5, 1), 1);
  return Math.min(Math.round((foodSupply * 50 + protectionRatio * 50)), 100);
}

export function calculateSoldierHappiness(player: {
  soldiers: number;
  food: number;
  weapons: number;
}): number {
  if (player.soldiers === 0) return 100;
  const foodSupply = Math.min(player.food / Math.max(player.soldiers, 1), 1);
  const weaponSupply = Math.min(player.weapons / Math.max(player.soldiers, 1), 1);
  return Math.min(Math.round((foodSupply * 50 + weaponSupply * 50)), 100);
}

// ==================== COMBAT POWER ====================
export function calculateCombatPower(player: {
  soldiers: number;
  weapons: number;
}): number {
  const basePower = player.soldiers * 2;
  const weaponBonus = Math.min(player.weapons, player.soldiers) * 2;
  return basePower + weaponBonus;
}

// ==================== ATTACK RESOLUTION ====================
export function resolveAttack(
  attacker: { soldiers: number; weapons: number; cars: number; },
  defender: { soldiers: number; weapons: number; operatives: number; },
  attackType: 'raid' | 'sabotage' | 'driveby' | 'bank'
): { success: boolean; attackerLosses: number; defenderLosses: number } {
  let attackerPower = calculateCombatPower(attacker);
  let defenderPower = calculateCombatPower(defender);

  if (attackType === 'driveby') {
    const carCapacity = attacker.cars * 8;
    const drivebySoldiers = Math.min(attacker.soldiers, carCapacity);
    if (drivebySoldiers === 0) {
      return { success: false, attackerLosses: 0, defenderLosses: 0 };
    }
    const drivebyWeapons = Math.min(attacker.weapons, drivebySoldiers);
    attackerPower = drivebySoldiers * 2 + drivebyWeapons * 2;
  }

  const attackerRandom = 0.8 + Math.random() * 0.4;
  const defenderRandom = 0.8 + Math.random() * 0.4;
  const finalAttackerPower = attackerPower * attackerRandom;
  const finalDefenderPower = defenderPower * defenderRandom;
  const success = finalAttackerPower > finalDefenderPower;

  const totalEngaged = attacker.soldiers + defender.soldiers;
  const intensity = Math.min(totalEngaged / 100, 0.5) + 0.05;

  let attackerLosses = 0;
  let defenderLosses = 0;

  if (success) {
    defenderLosses = Math.ceil(defender.soldiers * intensity * (0.5 + Math.random() * 0.5));
    attackerLosses = Math.ceil(attacker.soldiers * intensity * 0.1 * Math.random());
  } else {
    attackerLosses = Math.ceil(attacker.soldiers * intensity * (0.5 + Math.random() * 0.5));
    defenderLosses = Math.ceil(defender.soldiers * intensity * 0.1 * Math.random());
  }

  return { success, attackerLosses, defenderLosses };
}

// ==================== COLLECT ====================
export function calculateCollect(player: { operatives: number }): { amount: number; cost: number } {
  return { amount: 200 * player.operatives, cost: 1 };
}

// ==================== HIRE ====================
export function calculateHire(type: 'operative' | 'soldier'): { min: number; max: number; cost: number } {
  return { min: 1, max: 5, cost: 1 };
}

// ==================== TURN REGENERATION (settings-aware) ====================
export const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function calculateTurnRegen(lastMaxCheck: Date, now: Date, regenRate: number): number {
  const elapsed = now.getTime() - lastMaxCheck.getTime();
  const intervals = Math.floor(elapsed / REGEN_INTERVAL_MS);
  return intervals * regenRate;
}

// ==================== ATTACK RANGE (settings-aware) ====================
export function isInAttackRange(
  attackerNW: number,
  defenderNW: number,
  rangeAbove: number,
  rangeBelow: number
): boolean {
  if (attackerNW <= 0 || defenderNW <= 0) return false;
  if (rangeAbove === 0 || rangeBelow === 0) return true; // OFF = can attack anyone
  const minRange = attackerNW * (1 / rangeAbove);
  const maxRange = attackerNW * rangeBelow;
  return defenderNW >= minRange && defenderNW <= maxRange;
}

// ==================== MAXING CHECK (settings-aware) ====================
export function isMaxed(
  recentAttacks: { cashStolen: number; createdAt: Date }[],
  defenderNW: number,
  now: Date,
  maxingPercent: number
): boolean {
  if (defenderNW <= 0) return false;
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentTotal = recentAttacks
    .filter(a => new Date(a.createdAt) >= oneHourAgo)
    .reduce((sum, a) => sum + a.cashStolen, 0);
  return recentTotal >= defenderNW * (maxingPercent / 100);
}

// ==================== BANK (settings-aware) ====================
export function calculateMaxDeposit(cash: number, bank: number, bankPercent: number): number {
  const totalCash = cash + bank;
  const maxBankable = Math.floor(totalCash * (bankPercent / 100));
  return Math.max(0, maxBankable - bank);
}

// ==================== CREDIT SYSTEM ====================
export function calculateReservesFromCredits(credits: number, turnsPerCredit: number): number {
  return Math.floor(credits / turnsPerCredit) * turnsPerCredit;
}

export function calculateTurnsFromReserves(reserves: number, maxTurns: number, currentTurns: number): number {
  const canRedeem = Math.max(0, maxTurns - currentTurns);
  return Math.min(reserves, canRedeem);
}

// ==================== DEFAULT CONSTANTS (fallback) ====================
export const DEFAULT_MAX_TURNS = 500;
export const DEFAULT_TURNS_PER_REGEN = 5;
export const DEFAULT_STARTING_TURNS = 100;
export const DEFAULT_STARTING_CASH = 5000;
export const DEFAULT_BANK_PERCENT = 75;
export const DEFAULT_MAXING_PERCENT = 10;
export const DEFAULT_RANGE_ABOVE = 4;
export const DEFAULT_RANGE_BELOW = 0.5;
export const PROTECTION_HOURS = 24;
