// Game engine - all core game logic

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

  // Food supply: each op needs 1 food
  const foodSupply = Math.min(player.food / Math.max(player.operatives, 1), 1);
  // Protection: 1 soldier per 2 operatives minimum
  const protectionRatio = Math.min(player.soldiers / Math.max(player.operatives * 0.5, 1), 1);

  return Math.min(Math.round((foodSupply * 50 + protectionRatio * 50)), 100);
}

export function calculateSoldierHappiness(player: {
  soldiers: number;
  food: number;
  weapons: number;
}): number {
  if (player.soldiers === 0) return 100;

  // Food supply: each soldier needs 1 food
  const foodSupply = Math.min(player.food / Math.max(player.soldiers, 1), 1);
  // Weapon supply: 1 weapon per soldier ideal
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
  attackType: 'raid' | 'sabotage' | 'driveby'
): { success: boolean; attackerLosses: number; defenderLosses: number } {
  let attackerPower = calculateCombatPower(attacker);
  let defenderPower = calculateCombatPower(defender);

  // Drive-by: only use soldiers that fit in cars
  if (attackType === 'driveby') {
    const carCapacity = attacker.cars * 8;
    const drivebySoldiers = Math.min(attacker.soldiers, carCapacity);
    if (drivebySoldiers === 0) {
      return { success: false, attackerLosses: 0, defenderLosses: 0 };
    }
    const drivebyWeapons = Math.min(attacker.weapons, drivebySoldiers);
    attackerPower = drivebySoldiers * 2 + drivebyWeapons * 2;
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
  } else {
    // Defender wins - attacker loses more
    attackerLosses = Math.ceil(attacker.soldiers * intensity * (0.5 + Math.random() * 0.5));
    defenderLosses = Math.ceil(defender.soldiers * intensity * 0.1 * Math.random());
  }

  return { success, attackerLosses, defenderLosses };
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
