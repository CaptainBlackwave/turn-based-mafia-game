// Game constants for UI display

export const CITIES = [
  { id: 'New York', emoji: '🗽' },
  { id: 'Chicago', emoji: '🏙️' },
  { id: 'Los Angeles', emoji: '🌴' },
  { id: 'Miami', emoji: '🏖️' },
  { id: 'Las Vegas', emoji: '🎰' },
] as const;

export type CityId = typeof CITIES[number]['id'];

export const BLACK_MARKET_ITEMS = {
  supplies: [
    { id: 'food', name: 'Food', buyPrice: 50, sellPrice: 25, icon: '🍕' },
  ],
  weapons: [
    { id: 'weapon', name: 'Weapon', buyPrice: 1000, sellPrice: 500, icon: '🔫' },
  ],
  cars: [
    { id: 'car', name: 'Armored Car', buyPrice: 20000, sellPrice: 10000, icon: '🚗', capacity: 8 },
  ],
  planes: [
    { id: 'plane', name: 'Private Jet', buyPrice: 100000, sellPrice: 50000, icon: '✈️', capacity: 50 },
  ],
} as const;

export const ATTACK_TYPES = [
  {
    id: 'raid', name: 'Raid', description: 'Invade enemy headquarters. Steal cash and kill units.',
    icon: '💰', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20',
  },
  {
    id: 'sabotage', name: 'Sabotage', description: 'Raid supplies. Steal food and weapons, kill soldiers.',
    icon: '💣', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20',
  },
  {
    id: 'driveby', name: 'Drive-By Shooting', description: 'Maximum damage using cars. No resources stolen.',
    icon: '🚗', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20',
  },
  {
    id: 'bank', name: 'Bank Raid', description: 'Attack enemy bank vault. Steal from their bank balance.',
    icon: '🏦', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20',
  },
] as const;

export type AttackType = typeof ATTACK_TYPES[number]['id'];

export const HIRE_TYPES = [
  { id: 'operative', name: 'Operative', description: 'Scouts for operatives who produce income.', icon: '💼', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { id: 'soldier', name: 'Soldier', description: 'Scouts for soldiers who fight and defend.', icon: '🛡️', color: 'text-red-400', bgColor: 'bg-red-500/10' },
] as const;

export const COLLECT_TYPES = [
  { id: 'collect', name: 'Collect Income', description: 'Your operatives collect cash. $200 per operative per turn.', icon: '💵', requires: 'operatives', rate: 200, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
] as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'hire', label: 'Hire', icon: 'UserPlus' },
  { id: 'blackmarket', label: 'Black Market', icon: 'ShoppingCart' },
  { id: 'collect', label: 'Collect', icon: 'Wallet' },
  { id: 'bank', label: 'Bank', icon: 'Landmark' },
  { id: 'attack', label: 'Attack', icon: 'Crosshair' },
  { id: 'travel', label: 'Travel', icon: 'MapPin' },
  { id: 'family', label: 'Family', icon: 'Users' },
  { id: 'gambling', label: 'Casino', icon: 'Dices' },
  { id: 'credits', label: 'Credits', icon: 'CreditCard' },
  { id: 'unions', label: 'Unions', icon: 'Shield' },
  { id: 'transfers', label: 'Transfers', icon: 'ArrowLeftRight' },
  { id: 'leaderboard', label: 'Rankings', icon: 'Trophy' },
  { id: 'guide', label: 'Guide', icon: 'BookOpen' },
  { id: 'admin', label: 'Admin', icon: 'Settings' },
] as const;

export type ScreenId = typeof NAV_ITEMS[number]['id'];

export const BOT_NAMES = [
  'Vito Corleone', 'Tony Soprano', 'Michael Corleone', 'Al Capone', 'Lucky Luciano',
  'Carlo Gambino', 'John Gotti', 'Pablo Escobar', 'Frank Costello', 'Salvatore Maranzano',
  'Joe Masseria', 'Meyer Lansky', 'Bugsy Siegel', 'Dutch Schultz', 'Whitey Bulger',
  'Bumpy Johnson', 'Raymond Patriarca', 'Carlos Marcello', 'Sam Giancana', 'Nicky Scarfo',
] as const;

export const SUBSCRIPTION_TIERS = [
  { id: 'Free', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  { id: 'Titanium', color: 'text-slate-300', bg: 'bg-slate-400/10' },
  { id: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'Onyx', color: 'text-purple-400', bg: 'bg-purple-500/10' },
] as const;

export const DEFAULT_STARTING_TURNS = 100;
export const DEFAULT_STARTING_CASH = 5000;
export const PROTECTION_HOURS = 24;
