// Game Guide Data for The Mafia Boss - Modern Rebuild
// Simplified version

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  summary: string;
  content: string;
  tips: string[];
  order: number;
}

export const guideSections: GuideSection[] = [
  {
    id: "fast-start",
    title: "Fast Start",
    icon: "Zap",
    color: "amber",
    summary:
      "New to the game? Follow these essential steps to get your criminal empire off the ground quickly and safely.",
    content: `
<ol>
  <li>Go to the <strong>Hire</strong> section and scout for operatives and soldiers.</li>
  <li>Go to the <strong>Black Market</strong> to purchase food and weapons to make your crew happy. You need to arm your soldiers — unarmed soldiers won't do much in a fight. Keep an eye on happiness levels — unhappy crew will leave you.</li>
  <li>Make cash by going to <strong>Collect</strong> — your operatives generate $200 each per turn.</li>
  <li>When you have enough turns, go scout for more operatives and soldiers and repeat from step 1.</li>
  <li>When you feel strong enough, you can <strong>attack</strong> other players within range. Use raids for cash, sabotage for supplies, or drive-bys for maximum damage.</li>
  <li>You can protect up to 75% of your cash in the <strong>bank</strong>. This safeguards it from attacks.</li>
  <li><strong>Joining a family</strong> is wise — you won't survive very long by yourself. You can also create your own family.</li>
  <li>Enjoy the game and watch your back :)</li>
</ol>`,
    tips: [
      "Always bank 75% of your cash immediately after collecting — loose cash makes you a prime target.",
      "Join a family as soon as possible. The protection and guidance from experienced players is invaluable.",
      "Don't spend all your turns attacking early on — focus on building your operative and soldier count first.",
    ],
    order: 1,
  },
  {
    id: "networth",
    title: "Networth",
    icon: "TrendingUp",
    color: "yellow",
    summary:
      "Ranking is based on net worth. Every asset contributes to your total.",
    content: `
<p>Ranking is based on net worth. Here is how net worth is calculated:</p>

<p><strong>Units:</strong> Operatives (<span class="text-red-400">$1,500</span> each) + Soldiers (<span class="text-red-400">$600</span> each)</p>

<p><strong>Supplies:</strong> Food (<span class="text-red-400">$3</span> each)</p>

<p><strong>Weapons:</strong> Weapons (<span class="text-red-400">$1,000</span> each)</p>

<p><strong>Vehicles:</strong> Cars (<span class="text-red-400">$20,000</span> each)</p>

<p><strong>Planes:</strong> Planes (<span class="text-red-400">$100,000</span> each)</p>

<p><strong>Financial:</strong> cash + bank</p>

<p>= <strong>Net worth</strong></p>`,
    tips: [
      "Operatives are your most valuable unit type at $1,500 each — prioritize scouting for them.",
      "Planes are worth $100,000 each — a massive networth booster if you can protect them.",
      "Remember that cash on hand counts toward networth but also makes you a target.",
    ],
    order: 2,
  },
  {
    id: "turns",
    title: "Turns",
    icon: "Timer",
    color: "emerald",
    summary:
      "Turns are required for every action — attacking, hiring, collecting. They regenerate every 10 minutes.",
    content: `
<p>Turns are required for everything: attacking, hiring, collecting. Every <strong>10 minutes</strong> you receive 5 turns, up to a maximum of 500 turns.</p>

<p>Use your turns wisely — each action costs 1 turn. Make sure to log in regularly to use your turns before hitting the cap.</p>`,
    tips: [
      "Log in regularly to spend turns before you hit the cap — wasted regeneration time is lost opportunity.",
      "Balance your turn usage between scouting, collecting, and attacking.",
      "Never let turns sit at the cap — always keep them flowing by using them productively.",
    ],
    order: 3,
  },
  {
    id: "hire",
    title: "Hire",
    icon: "UserPlus",
    color: "teal",
    summary:
      "Scout for crew members using your turns. Operatives generate income, soldiers fight and defend.",
    content: `
<p>Pay others to do your dirty work. You need different types of personnel to perform all the different tasks.</p>

<p><strong>Operatives</strong> run your businesses and generate income. Each operative collects $200 per turn when you use the Collect action.</p>

<p><strong>Soldiers</strong> fight and defend your empire. They protect your operatives and can attack other players. Arm them with weapons from the Black Market for maximum effectiveness.</p>`,
    tips: [
      "Spend the majority of your early turns scouting — a large crew early on compounds into massive income.",
      "Balance your hires between operatives and soldiers. All operatives and no defense makes you an easy target.",
      "Scout regularly throughout the game — never stop growing your crew.",
    ],
    order: 4,
  },
  {
    id: "happiness",
    title: "Happiness",
    icon: "Smile",
    color: "pink",
    summary:
      "A happy crew is critical. If they're not happy, they'll start leaving you.",
    content: `
<p>Having a happy crew is critical to success. If your operatives or soldiers are not happy, they will start leaving you.</p>

<p><strong>Operative Happiness (50% food + 50% protection):</strong></p>
<ul>
  <li>Each operative needs <strong>1 food</strong> to be happy.</li>
  <li>They need <strong>1 soldier per 2 operatives</strong> for protection.</li>
</ul>

<p><strong>Soldier Happiness (50% food + 50% weapons):</strong></p>
<ul>
  <li>Each soldier needs <strong>1 food</strong> to be happy.</li>
  <li>Each soldier needs <strong>1 weapon</strong> to be happy.</li>
</ul>`,
    tips: [
      "Check your crew happiness every time you log in — don't wait for the warning signs of desertion.",
      "Buy food in bulk when you have the cash — keeping everyone fed is the foundation of happiness.",
      "Arming your soldiers isn't just about happiness — it doubles their combat power.",
    ],
    order: 5,
  },
  {
    id: "black-market",
    title: "Black Market",
    icon: "ShoppingBag",
    color: "slate",
    summary:
      "Buy supplies, weapons, cars, and planes. Sell items if needed, but you won't get full price back.",
    content: `
<p>In the black market you can buy whatever you need. You can purchase supplies, weapons, cars and planes. You can also sell your items if needed, but you won't get as much back as you paid.</p>

<ol>
  <li><strong>Supplies</strong> — Food ($50 buy / $25 sell). Each unit needs 1 food to stay happy.</li>
  <li><strong>Weapons</strong> — Weapons ($1,000 buy / $500 sell). Each weapon doubles a soldier's combat power. Give 1 weapon per soldier for max happiness and power.</li>
  <li><strong>Cars</strong> — Armored Cars ($20,000 buy / $10,000 sell). Each car seats 8 soldiers for drive-by attacks. Cars are required for drive-by shooting attacks.</li>
  <li><strong>Planes</strong> — Private Jets ($100,000 buy / $50,000 sell). Planes add $100,000 to your networth each.</li>
</ol>`,
    tips: [
      "Stock up on food early — it's cheap and essential for keeping your whole crew happy.",
      "Always arm your soldiers with weapons — unarmed soldiers fight at half strength.",
      "Cars and planes are networth boosters but also make you a target — protect them with strong defenses.",
    ],
    order: 6,
  },
  {
    id: "collect",
    title: "Collect",
    icon: "Wallet",
    color: "green",
    summary:
      "Use turns to collect cash from your businesses — $200 per operative per turn.",
    content: `
<p>Use turns to collect cash from your businesses. Each operative generates <strong>$200 per turn</strong>.</p>

<p>The more operatives you have, the more cash you collect per turn. Build a large operative workforce early to maximize your income.</p>`,
    tips: [
      "Always check your operatives' happiness BEFORE collecting — happy operatives collect more efficiently.",
      "Collect, then bank immediately. Never walk around with loose cash.",
      "More operatives = more income per turn. Scout aggressively in the early game.",
    ],
    order: 7,
  },
  {
    id: "bank",
    title: "Cash And The Bank",
    icon: "Landmark",
    color: "cyan",
    summary:
      "Deposit up to 75% of your money in the bank to keep it safe from attacks.",
    content: `
<p>Keeping money in your pocket is risky. Other players can attack you and take whatever you have. Deposit a part of it in the bank.</p>

<p>You are able to deposit up to <strong>75%</strong> of your total cash into the bank. You can withdraw it all when you need it for free.</p>`,
    tips: [
      "Develop a collect → bank → scout → collect rhythm. Never leave large amounts of cash sitting unbanked.",
      "The 75% limit means you'll always have some loose cash — use strong soldiers to protect what can't be banked.",
      "If you know you're about to be attacked, try to bank right before to minimize losses.",
    ],
    order: 8,
  },
  {
    id: "attacking",
    title: "Attacking",
    icon: "Swords",
    color: "rose",
    summary:
      "Attack players within your networth range. Choose from 3 attack types.",
    content: `
<p>You can only attack players between <strong>0.5x to 4x</strong> your net worth, and only in the same city.</p>

<p>Each soldier has a base combat power of 2. Armed soldiers (with weapons) get an additional +2 power each. The game auto-equips weapons to soldiers.</p>

<p><strong>There are 3 attack types:</strong></p>

<ol>
  <li><strong>Raid</strong> — Invade enemy headquarters. Steal 8-25% of their cash, kill 10-25% of soldiers and 5-15% of operatives if you win.</li>
  <li><strong>Sabotage</strong> — Raid enemy supplies. Steal 10-25% of their food and weapons, kill 8-20% of soldiers if you win.</li>
  <li><strong>Drive-By</strong> — Maximum damage using cars. Each car seats 8 soldiers. No resources are stolen, but damage is devastating.</li>
</ol>

<p>Each attack costs <strong>1 turn</strong>. There is a maxing limit: you can only steal up to 10% of a player's networth per hour.</p>`,
    tips: [
      "Always scout your target before attacking — check their soldier count and weapons.",
      "Use drive-bys to weaken strong targets before going for resource theft.",
      "Sabotaging supplies is devastating long-term — it steals food and weapons, weakening their happiness and combat power.",
      "Stay within your attack range. Attacking someone at 4x your networth is risky.",
    ],
    order: 9,
  },
  {
    id: "travel",
    title: "Travel",
    icon: "MapPin",
    color: "sky",
    summary:
      "Travel between cities to escape enemies, hunt targets, or return to your family's home turf.",
    content: `
<p>Traveling is used for different purposes: running away from attackers, hunting targets in other cities, or returning to your family's city.</p>

<p>Being in your own city has pros and cons. Your family offers <strong>more protection</strong> in your hometown, but it's also <strong>easier for enemies to find you</strong>.</p>`,
    tips: [
      "If you're being targeted, traveling to another city can buy you time to rebuild.",
      "Being in your family's city gives you backup — but also makes you easier to locate.",
    ],
    order: 10,
  },
  {
    id: "families",
    title: "Families",
    icon: "Users",
    color: "purple",
    summary:
      "Join a family for protection, respect, and trust — or create your own.",
    content: `
<p>TheMafiaBoss is a simulation of the mafia underworld. You can join <strong>families</strong> — a group of people sharing the same goals.</p>

<p>A family can bring <strong>protection</strong> and <strong>respect</strong> from other players, and it can allow you to <strong>trust</strong> in your fellow members.</p>`,
    tips: [
      "Don't wait to be invited — actively seek out families that are recruiting.",
      "Choose a family with active members across different time zones for round-the-clock protection.",
      "Loyalty pays off — families remember who stood with them during tough times.",
    ],
    order: 11,
  },
  {
    id: "protection",
    title: "Protection Program",
    icon: "ShieldCheck",
    color: "green",
    summary:
      "All new players start with 24 hours of protection from attacks. Use this time wisely.",
    content: `
<p>All new players start under <strong>Protection Program</strong> for the first <strong>24 hours</strong>. This allows you to learn the game while protected from attacks.</p>

<ul>
  <li><strong>Attack:</strong> Protected Players cannot attack or be attacked.</li>
  <li><strong>Travel:</strong> Protected Players cannot travel.</li>
  <li><strong>Bank:</strong> Protected Players cannot transfer money.</li>
</ul>`,
    tips: [
      "Use your 24-hour protection window to scout as many operatives and soldiers as possible.",
      "Bank your collected cash during protection so it's safe when protection expires.",
      "Stock up on food and weapons from the Black Market while protected.",
    ],
    order: 12,
  },
];
