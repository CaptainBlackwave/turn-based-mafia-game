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
  narcotics: [
    { id: 'alcohol', name: 'Alcohol', buyPrice: 50, sellPrice: 25, icon: '🍺' },
    { id: 'weed', name: 'Weed', buyPrice: 100, sellPrice: 50, icon: '🌿' },
    { id: 'coke', name: 'Cocaine', buyPrice: 200, sellPrice: 100, icon: '❄️' },
  ],
  weapons: [
    { id: 'glock', name: 'Glock', buyPrice: 400, sellPrice: 200, icon: '🔫' },
    { id: 'shotgun', name: 'Shotgun', buyPrice: 800, sellPrice: 400, icon: '💥' },
    { id: 'uzi', name: 'Uzi', buyPrice: 2000, sellPrice: 1000, icon: '🔥' },
    { id: 'ak47', name: 'AK-47', buyPrice: 4000, sellPrice: 2000, icon: '⚔️' },
  ],
  cars: [
    { id: 'chrysler', name: 'Chrysler 300', buyPrice: 8000, sellPrice: 4000, icon: '🚗', capacity: 5 },
    { id: 'limo', name: 'S-Class Limo', buyPrice: 40000, sellPrice: 20000, icon: '🚘', capacity: 10 },
  ],
  planes: [
    { id: 'gulfstream', name: 'Gulfstream Jet', buyPrice: 40000, sellPrice: 20000, icon: '✈️', capacity: 40 },
    { id: 'boeing', name: 'Boeing 737', buyPrice: 250000, sellPrice: 125000, icon: '🛫', capacity: 300 },
  ],
} as const;

export const ATTACK_TYPES = [
  {
    id: 'raid',
    name: 'Raid',
    description: 'Invade enemy headquarters. Steal cash and kill units if you win.',
    icon: '💰',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'sabotage',
    name: 'Sabotage Drug Labs',
    description: 'Kill enemy soldiers and steal weapons and drugs.',
    icon: '💣',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    id: 'driveby',
    name: 'Drive-By Shooting',
    description: 'Maximum damage attack. Requires cars. No resources stolen.',
    icon: '🚗',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
] as const;

export type AttackType = typeof ATTACK_TYPES[number]['id'];

export const HIRE_TYPES = [
  {
    id: 'operative',
    name: 'Operative',
    description: 'Scouts for operatives who run businesses and produce income.',
    icon: '💼',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'Scouts for soldiers who fight, defend, and produce narcotics.',
    icon: '🛡️',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
] as const;

export const PRODUCE_TYPES = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    description: 'Your operatives produce alcohol in the speakeasy. 3 per operative per turn.',
    icon: '🍺',
    requires: 'operatives',
    rate: 3,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'coke',
    name: 'Cocaine',
    description: 'Your soldiers produce cocaine in the drug lab. 3 per soldier per turn.',
    icon: '❄️',
    requires: 'soldiers',
    rate: 3,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
  {
    id: 'weed',
    name: 'Weed',
    description: 'Your soldiers produce weed in the drug lab. 3 per soldier per turn.',
    icon: '🌿',
    requires: 'soldiers',
    rate: 3,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
] as const;

export const COLLECT_TYPES = [
  {
    id: 'collect',
    name: 'Collect Income',
    description: 'Your operatives collect cash from all businesses. $200 per operative per turn.',
    icon: '💵',
    requires: 'operatives',
    rate: 200,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
] as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'hire', label: 'Hire', icon: 'UserPlus' },
  { id: 'blackmarket', label: 'Black Market', icon: 'ShoppingCart' },
  { id: 'produce', label: 'Produce', icon: 'Factory' },
  { id: 'collect', label: 'Collect', icon: 'Wallet' },
  { id: 'bank', label: 'Bank', icon: 'Landmark' },
  { id: 'attack', label: 'Attack', icon: 'Crosshair' },
  { id: 'travel', label: 'Travel', icon: 'MapPin' },
  { id: 'family', label: 'Family', icon: 'Users' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { id: 'guide', label: 'Guide', icon: 'BookOpen' },
] as const;

export type ScreenId = typeof NAV_ITEMS[number]['id'];

export const BOT_NAMES = [
  'Vito Corleone', 'Tony Soprano', 'Michael Corleone', 'Al Capone', 'Lucky Luciano',
  'Carlo Gambino', 'John Gotti', 'Pablo Escobar', 'Frank Costello', 'Salvatore Maranzano',
  'Joe Masseria', 'Meyer Lansky', 'Bugsy Siegel', 'Dutch Schultz', 'Whitey Bulger',
  'Bumpy Johnson', 'Raymond Patriarca', 'Carlos Marcello', 'Sam Giancana', 'Nicky Scarfo',
] as const;

export const MAX_TURNS = 500;
export const STARTING_TURNS = 100;
export const STARTING_CASH = 5000;
export const PROTECTION_HOURS = 24;
