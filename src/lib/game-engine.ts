// Game engine - all core game logic

// ==================== NETWORTH ====================
export function calculateNetworth(player: {
  operatives: number;
  soldiers: number;
  alcohol: number;
  weed: number;
  coke: number;
  glocks: number;
  shotguns: number;
  uzis: number;
  ak47s: number;
  chryslers: number;
  limos: number;
  gulfstreams: number;
  boeings: number;
  cash: number;
  bank: number;
}): number {
  const unitNW = player.operatives * 1500 + player.soldiers * 600;
  const drugNW = player.alcohol * 1 + player.weed * 2 + player.coke * 5;
  const weaponNW = player.glocks * 400 + player.shotguns * 800 + player.uzis * 2000 + player.ak47s * 4000;
  const vehicleNW = player.chryslers * 8000 + player.limos * 40000;
  const planeNW = player.gulfstreams * 40000 + player.boeings * 250000;
  const financialNW = player.cash + player.bank;

  return unitNW + drugNW + weaponNW + vehicleNW + planeNW + financialNW;
}

// ==================== HAPPINESS ====================
export function calculateOpHappiness(player: {
  operatives: number;
  soldiers: number;
  alcohol: number;
  coke: number;
}): number {
  if (player.operatives === 0) return 100;

  // Alcohol supply: each op needs alcohol
  const alcoholSupply = Math.min(player.alcohol / Math.max(player.operatives, 1), 1);
  // Coke supply: each op benefits from coke
  const cokeSupply = Math.min(player.coke / Math.max(player.operatives, 1), 1);
  // Protection: 1 soldier per 2 operatives minimum
  const protectionRatio = Math.min(player.soldiers / Math.max(player.operatives * 0.5, 1), 1);

  return Math.min(Math.round((alcoholSupply * 30 + cokeSupply * 35 + protectionRatio * 35)), 100);
}

export function calculateSoldierHappiness(player: {
  soldiers: number;
  alcohol: number;
  weed: number;
  glocks: number;
  shotguns: number;
  uzis: number;
  ak47s: number;
}): number {
  if (player.soldiers === 0) return 100;

  // Alcohol supply
  const alcoholSupply = Math.min(player.alcohol / Math.max(player.soldiers, 1), 1);
  // Weed supply
  const weedSupply = Math.min(player.weed / Math.max(player.soldiers, 1), 1);
  // Weapon supply: 2 weapons per soldier ideal
  const totalWeapons = player.glocks + player.shotguns + player.uzis + player.ak47s;
  const weaponSupply = Math.min(totalWeapons / Math.max(player.soldiers * 2, 1), 1);

  return Math.min(Math.round((alcoholSupply * 25 + weedSupply * 30 + weaponSupply * 45)), 100);
}

// ==================== COMBAT POWER ====================
const WEAPON_POWER: Record<string, number> = {
  glock: 1,
  shotgun: 1.5,
  uzi: 2,
  ak47: 3,
};

export function calculateCombatPower(player: {
  soldiers: number;
  glocks: number;
  shotguns: number;
  uzis: number;
  ak47s: number;
}): number {
  const basePower = player.soldiers * 2;
  
  // Best weapon per soldier
  const weaponSlots = player.soldiers;
  let remainingSlots = weaponSlots;
  let weaponBonus = 0;

  // Distribute best weapons first
  const ak47Used = Math.min(player.ak47s, remainingSlots);
  remainingSlots -= ak47Used;
  weaponBonus += ak47Used * WEAPON_POWER.ak47;

  const uziUsed = Math.min(player.uzis, remainingSlots);
  remainingSlots -= uziUsed;
  weaponBonus += uziUsed * WEAPON_POWER.uzi;

  const shotgunUsed = Math.min(player.shotguns, remainingSlots);
  remainingSlots -= shotgunUsed;
  weaponBonus += shotgunUsed * WEAPON_POWER.shotgun;

  const glockUsed = Math.min(player.glocks, remainingSlots);
  weaponBonus += glockUsed * WEAPON_POWER.glock;

  return basePower + weaponBonus;
}

// ==================== ATTACK RESOLUTION ====================
export function resolveAttack(
  attacker: { soldiers: number; glocks: number; shotguns: number; uzis: number; ak47s: number; chryslers: number; limos: number; },
  defender: { soldiers: number; glocks: number; shotguns: number; uzis: number; ak47s: number; operatives: number; },
  attackType: 'raid' | 'sabotage' | 'driveby'
): { success: boolean; attackerLosses: number; defenderLosses: number } {
  let attackerPower = calculateCombatPower(attacker);
  let defenderPower = calculateCombatPower(defender);

  // Drive-by: only use soldiers that fit in cars
  if (attackType === 'driveby') {
    const carCapacity = attacker.chryslers * 5 + attacker.limos * 10;
    const drivebySoldiers = Math.min(attacker.soldiers, carCapacity);
    if (drivebySoldiers === 0) {
      return { success: false, attackerLosses: 0, defenderLosses: 0 };
    }
    // Recalculate with limited soldiers
    attackerPower = drivebySoldiers * 2;
    let remSlots = drivebySoldiers;
    let wpBonus = 0;
    const ak = Math.min(attacker.ak47s, remSlots); remSlots -= ak; wpBonus += ak * 3;
    const uz = Math.min(attacker.uzis, remSlots); remSlots -= uz; wpBonus += uz * 2;
    const sg = Math.min(attacker.shotguns, remSlots); remSlots -= sg; wpBonus += sg * 1.5;
    const gl = Math.min(attacker.glocks, remSlots); wpBonus += gl * 1;
    attackerPower += wpBonus;
  }

  // Random factor ±20%
  const attackerRandom = 0.8 + Math.random() * 0.4;
  const defenderRandom = 0.8 + Math.random() * 0.4;

  const finalAttackerPower = attackerPower * attackerRandom;
  const finalDefenderPower = defenderPower * defenderRandom;

  const success = finalAttackerPower > finalDefenderPower;

  // Calculate losses
  const totalEngaged = attacker.soldiers + defender.soldiers;
  const intensity = Math.min(totalEngaged / 100, 0.5) + 0.05;

  let attackerLosses = 0;
  let defenderLosses = 0;

  if (success) {
    // Attacker wins - defender loses more
    defenderLosses = Math.ceil(defender.soldiers * intensity * (0.5 + Math.random() * 0.5));
    attackerLosses = Math.ceil(attacker.soldiers * intensity * 0.1 * Math.random());

    // Raid also kills operatives
    if (attackType === 'raid') {
      // ops killed handled separately
    }
  } else {
    // Defender wins - attacker loses more
    attackerLosses = Math.ceil(attacker.soldiers * intensity * (0.5 + Math.random() * 0.5));
    defenderLosses = Math.ceil(defender.soldiers * intensity * 0.1 * Math.random());
  }

  return { success, attackerLosses, defenderLosses };
}

// ==================== PRODUCE ====================
export function calculateProduction(
  type: 'alcohol' | 'weed' | 'coke',
  player: { operatives: number; soldiers: number; }
): { amount: number; cost: number } {
  switch (type) {
    case 'alcohol':
      return { amount: 3 * player.operatives, cost: 1 };
    case 'coke':
      return { amount: 3 * player.soldiers, cost: 1 };
    case 'weed':
      return { amount: 3 * player.soldiers, cost: 1 };
    default:
      return { amount: 0, cost: 1 };
  }
}

// ==================== COLLECT ====================
export function calculateCollect(player: {
  operatives: number;
}): { amount: number; cost: number } {
  return { amount: 200 * player.operatives, cost: 1 };
}

// ==================== HIRE ====================
export function calculateHire(type: 'operative' | 'soldier'): { min: number; max: number; cost: number } {
  return { min: 1, max: 5, cost: 1 };
}

// ==================== TURN REGENERATION ====================
export const MAX_TURNS = 500;
export const TURNS_PER_REGEN = 5;
export const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function calculateTurnRegen(lastMaxCheck: Date, now: Date): number {
  const elapsed = now.getTime() - lastMaxCheck.getTime();
  const intervals = Math.floor(elapsed / REGEN_INTERVAL_MS);
  return intervals * TURNS_PER_REGEN;
}

// ==================== ATTACK RANGE ====================
export function isInAttackRange(attackerNW: number, defenderNW: number): boolean {
  if (attackerNW <= 0 || defenderNW <= 0) return false;
  const minRange = attackerNW * 0.5;
  const maxRange = attackerNW * 4;
  return defenderNW >= minRange && defenderNW <= maxRange;
}

// ==================== MAXING CHECK ====================
export const MAXING_PERCENT = 0.10; // 10% of networth per hour

export function isMaxed(recentAttacks: { cashStolen: number; createdAt: Date }[], defenderNW: number, now: Date): boolean {
  if (defenderNW <= 0) return false;
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentTotal = recentAttacks
    .filter(a => new Date(a.createdAt) >= oneHourAgo)
    .reduce((sum, a) => sum + a.cashStolen, 0);
  return recentTotal >= defenderNW * MAXING_PERCENT;
}

// ==================== BANK ====================
export const MAX_BANK_PERCENT = 0.75;

export function calculateMaxDeposit(cash: number, bank: number): number {
  const totalCash = cash + bank;
  const maxBankable = Math.floor(totalCash * MAX_BANK_PERCENT);
  return Math.max(0, maxBankable - bank);
}
