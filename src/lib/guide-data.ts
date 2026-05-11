// Game Guide Data for The Mafia Boss - Modern Rebuild
// All content faithfully sourced from the original guide at themafiaboss.com

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
  <li>Go to the <strong>Hire</strong> section and scout for defensive units and/or operatives.</li>
  <li>Go to the <strong>Black Market</strong> to purchase drugs and alcohol and weapons to make your crew happy. You need to arm your defensive units. Keep in mind that defensive units without weapons won't do a thing. Also pay attention to your happiness levels. It's easy to keep them happy but if you don't they will leave you.</li>
  <li>Make some cash by <strong>collecting</strong> from your casinos, brothels, loan sharks, and gambling dens.</li>
  <li>When you have enough turns, go scout for more operatives and defensive units and repeat from step 1.</li>
  <li>When you feel strong enough, you can <strong>attack</strong> other players within range. Keep in mind that when you attack someone they will have a revenge to use against you. This is the real Mafia World: "an eye for an eye, arm, and a leg".</li>
  <li>You can protect a percentage of your cash in the <strong>bank</strong>. This will safeguard it from attacks.</li>
  <li><strong>Joining a family</strong> is wise, since you won't be able to survive very long by yourself. You also have the option of creating your own family.</li>
  <li>Enjoy the game and watch your back :)</li>
</ol>`,
    tips: [
      "Always bank 75% of your cash immediately after collecting — loose cash makes you a prime target.",
      "Join a family as soon as possible. The protection and guidance from experienced players is invaluable.",
      "Don't spend all your turns attacking early on — focus on building your operative and defensive unit count first.",
    ],
    order: 1,
  },
  {
    id: "rounds",
    title: "Rounds",
    icon: "RotateCcw",
    color: "blue",
    summary:
      "Each game round lasts about 10 days and then everything resets. A clean slate for everyone — use it or lose it.",
    content: `
<p>Each round lasts about <strong>10 days</strong> to make it fair for newcomers, and give everyone a better chance to win. Once the round ends everything starts over from scratch. You can select a new name at the start of each round.</p>
<p>Each round is clean slate. Nothing will roll over from round to round. This means all turns, cash, defensive units, operatives, guns, drugs, cars and planes; none of it follows you in the next round. <strong>Use it or lose it.</strong></p>`,
    tips: [
      "Use the first 2-3 days of a round to build up your operatives and defensive units before engaging in conflicts.",
      "Pay attention to when a round is ending — position yourself for a strong finish in the last 24-48 hours.",
    ],
    order: 2,
  },
  {
    id: "turns-and-reserves",
    title: "Turns And Reserves",
    icon: "Timer",
    color: "emerald",
    summary:
      "Turns are required for every action — attacking, hiring, collecting. They regenerate every 10 minutes, or buy them with credits.",
    content: `
<p>Turns are required for everything. For example: attacking someone, hiring defensive units, collecting cash from your whores. All of these actions require turns. Every <strong>10 minutes</strong> you will receive a certain number of turns, depending on the round's settings. You also start each round with a given amount of reserves. These reserves can be used at anytime during the active round. Reserves do not carry over into the next round.</p>

<p><strong>You can get more turns in three ways:</strong></p>
<ol>
  <li><strong>Purchase a subscription</strong>, which increases the amount of turns you get every 10 minutes. This is the most economical way to get more turns.</li>
  <li><strong>Purchase turns/credits directly</strong>, which you can add to any round you choose and use whenever you want.</li>
  <li><strong>Win turns/credits</strong> by finishing the round in a top ten position in a ranking family and/or individual category.</li>
</ol>

<p>In order to use credits, they must be moved from your account to your active reserves. Once in your reserves, they must be used in that round. Unused reserves are lost at the end of the round. Won credits expire <strong>30 days</strong> after they are issued, so don't let them go unused.</p>`,
    tips: [
      "Log in regularly to spend turns before you hit the cap — wasted regeneration time is lost opportunity.",
      "Save your credits for critical moments in the round when extra turns can make the difference.",
      "Never let turns sit at the cap — always keep them flowing by using them productively.",
    ],
    order: 3,
  },
  {
    id: "networth",
    title: "Networth",
    icon: "TrendingUp",
    color: "yellow",
    summary:
      "Ranking is based on net worth. Every asset — from operatives to weapons to planes — contributes to your total.",
    content: `
<p>Ranking is based on net worth. Here is how net worth is calculated:</p>

<p><strong>Operatives:</strong> Card Dealers (<span class="text-red-400">$2,500</span>) + Whores (<span class="text-red-400">$2,000</span>) + Bootleggers (<span class="text-red-400">$1,500</span>) + Hustlers (<span class="text-red-400">$1,000</span>) + Punks (<span class="text-red-400">$500</span>)</p>

<p><strong>Defensive Units:</strong> Hitmen (<span class="text-red-400">$1,000</span>) + Thugs (<span class="text-red-400">$500</span>) + Bodyguards (<span class="text-red-400">$300</span>)</p>

<p><strong>Financial:</strong> cash + bank</p>

<p><strong>Vehicles:</strong> Chrysler 300 (<span class="text-red-400">$8,000</span>) + S-Class long (<span class="text-red-400">$40,000</span>) + Gulfstream Jet (<span class="text-red-400">$40,000</span>) + Boeing 737-400 (<span class="text-red-400">$250,000</span>)</p>

<p><strong>Narcotics:</strong> alcohol (<span class="text-red-400">$1</span>) + Weed (<span class="text-red-400">$2</span>) + Coke (<span class="text-red-400">$5</span>)</p>

<p><strong>Weapons:</strong> Glock (<span class="text-red-400">$400</span>) + Shotgun (<span class="text-red-400">$800</span>) + Uzi (<span class="text-red-400">$2,000</span>) + AK-47 (<span class="text-red-400">$4,000</span>)</p>

<p>= <strong>Net worth</strong></p>`,
    tips: [
      "Card Dealers have the highest operative value at $2,500 each — prioritize scouting for them.",
      "Boeing 737-400 planes are worth $250,000 each — a massive networth booster if you can protect them.",
      "Remember that cash on hand counts toward networth but also makes you a target.",
    ],
    order: 4,
  },
  {
    id: "families",
    title: "Families",
    icon: "Users",
    color: "purple",
    summary:
      "Join a family for protection, respect, and trust — or create your own. The mafia underworld is built on loyalty.",
    content: `
<p>TheMafiaBoss is a simulation of the mafia underworld. Just like the real mafia, you can join <strong>families</strong> — a group of people sharing the same goals and philosophy.</p>

<p>A family can bring <strong>protection</strong> and <strong>respect</strong> from other players, and it can allow you to <strong>trust</strong> in your fellow members. Trust and respect can save your life, but can also get you killed.</p>`,
    tips: [
      "Don't wait to be invited — actively seek out families that are recruiting.",
      "Choose a family with active members across different time zones for round-the-clock protection.",
      "Loyalty pays off — families remember who stood with them during tough times.",
    ],
    order: 5,
  },
  {
    id: "hire",
    title: "Hire",
    icon: "UserPlus",
    color: "teal",
    summary:
      "Scout for crew members using your turns. Operatives generate income, defensive units provide protection.",
    content: `
<p>One of the basics of organized crime is to do things your own way and not end up in prison. This is accomplished by not committing any crimes yourself, instead <strong>paying others to do your dirty work</strong>.</p>

<p>In order to maintain this power, you need different types of personnel to perform all the different tasks and duties. To scout for crew members, use your turns and scout in the place offering the type of people you are looking for.</p>`,
    tips: [
      "Spend the majority of your early turns scouting — a large crew early on compounds into massive income.",
      "Balance your hires between operatives and defensive units. All operatives and no defense makes you an easy target.",
      "Scout regularly throughout the round — never stop growing your crew.",
    ],
    order: 6,
  },
  {
    id: "operatives",
    title: "Operatives",
    icon: "Briefcase",
    color: "orange",
    summary:
      "Operatives work in your businesses and produce different kinds of goods or collect cash. There are 5 types.",
    content: `
<p>Operatives work in your businesses and produce different kind of goods or collect cash. The operatives you can hire are:</p>

<ol>
  <li><strong>Card dealers</strong> — work in your casino and determine how much cash your tables roll out.</li>
  <li><strong>Whores</strong> — work in your brothel and determine how much cash people will pay for a good time.</li>
  <li><strong>Bootleggers</strong> — work in your speakeasy and determine how much liquor you will produce.</li>
  <li><strong>Hustlers</strong> — work in your loan shark's office and collect loan payments.</li>
  <li><strong>Punks</strong> — work in your gambling den and push people to bet.</li>
</ol>`,
    tips: [
      "Card dealers generate the most income per operative — prioritize them for scouting.",
      "Bootleggers serve double duty: they produce income AND generate alcohol for crew happiness.",
      "Never let your operatives' happiness drop — unhappy operatives produce significantly less income.",
    ],
    order: 7,
  },
  {
    id: "defensive-units",
    title: "Defensive Units",
    icon: "Shield",
    color: "red",
    summary:
      "Defensive units protect you and your operatives, and can attack other players. There are 3 types with different strengths.",
    content: `
<p>Defensive units protect you and your operatives, and can attack other players. The defensive units you can hire are:</p>

<ol>
  <li><strong>Hitmen</strong> — their strength is their intelligence and superb weapons skills. They kill for you and protect you.</li>
  <li><strong>Thugs</strong> — not as intelligent or well mannered as Hitmen. They also attack others and protect you.</li>
  <li><strong>Bodyguards</strong> — really easy to get and will protect you well. However, they are not that effective when attacking.</li>
</ol>`,
    tips: [
      "A mix of bodyguards (for defense) and hitmen (for attack) creates the strongest combat force.",
      "Thugs are versatile — they can also produce narcotics in your drug lab.",
      "Always arm your defensive units — unarmed units are nearly useless in a fight.",
    ],
    order: 8,
  },
  {
    id: "happiness",
    title: "Happiness",
    icon: "Smile",
    color: "pink",
    summary:
      "Having a happy crew is critical. If they're not happy, they'll start leaving you as soon as you ask them to work.",
    content: `
<p>Having a happy crew is critical to success. If your operatives or defensive units are not happy, they will start leaving you as soon as you ask them to work.</p>

<p><strong>Your operatives need:</strong></p>
<ul>
  <li><strong>Alcohol</strong> and <strong>coke</strong> to be happy.</li>
  <li>They will also need <strong>defensive units</strong> to protect them.</li>
</ul>

<p><strong>Your defensive units need:</strong></p>
<ul>
  <li><strong>Alcohol</strong> and <strong>weed</strong> to be happy.</li>
  <li>They need to have anywhere from <strong>2 Glocks to 1 AK-47</strong> per defensive unit to be happy.</li>
</ul>`,
    tips: [
      "Check your crew happiness every time you log in — don't wait for the warning signs of desertion.",
      "Buy narcotics in bulk when prices are good on the Black Market.",
      "Arming your defensive units isn't just about happiness — it's about survival.",
    ],
    order: 9,
  },
  {
    id: "black-market",
    title: "Black Market",
    icon: "ShoppingBag",
    color: "slate",
    summary:
      "Buy narcotics, weapons, cars, and planes. Sell items if needed, but you won't get full price back — decide wisely.",
    content: `
<p>In the black market you can buy whatever you need. You can purchase narcotics, weapons, cars and planes. You can also sell your items if needed, but you won't get as much back as you paid for them in the first place, so make your decisions wisely.</p>

<ol>
  <li><strong>Narcotics</strong> are mainly used to make your guys happy. Your defensive units need alcohol and weed to be happy. Your operatives need alcohol and coke to be happy.</li>
  <li><strong>Weapons</strong> are used for attacks and defense as well as maintaining happiness. You can purchase Glocks, Shotguns, even Uzis and AK-47s. You must have one gun per defensive unit and can sell all weapons that are in excess of your defensive units. The more expensive the weapon, the more efficient it is in dealing death.</li>
  <li><strong>Cars</strong> are used for drive-by attacks and stealing other player's cars. The Chrysler 300 seats 5 people and the S-Class limo seats 10 people.</li>
  <li><strong>Planes</strong> are used to travel to other cities and stealing other player's planes. If you have enough planes, you won't need to purchase plane tickets to travel to other cities. The Gulfstream jet can fly 40 people and the Boeing 737-400 can fly 300 people.</li>
</ol>`,
    tips: [
      "Watch narcotic prices and buy in bulk when they're low — you'll save a fortune over the round.",
      "Always arm your defensive units with the best weapons you can afford — AK-47s make a huge difference.",
      "Cars and planes are networth boosters but also theft magnets — protect them with strong defenses.",
    ],
    order: 10,
  },
  {
    id: "produce",
    title: "Produce",
    icon: "Factory",
    color: "lime",
    summary:
      "Use turns to produce coke, weed, alcohol, and fake cash. Self-sufficiency saves you money on the Black Market.",
    content: `
<p>Production is one part of your illegal activity. You can use turns to produce coke, weed, and alcohol as well as cash.</p>

<ol>
  <li><strong>Thugs</strong> are used to produce coke and weed in your drug lab.</li>
  <li><strong>Bootleggers</strong> are used to produce alcohol in your speakeasy.</li>
  <li><strong>Punks</strong> are used to print fake money.</li>
</ol>`,
    tips: [
      "Invest in bootleggers early — their alcohol production keeps your whole crew happy AND they generate collectible income.",
      "Thugs that produce coke and weed are essentially free narcotic factories.",
      "Don't spend all your turns producing — you still need turns for collecting, scouting, and defending.",
    ],
    order: 11,
  },
  {
    id: "collect",
    title: "Collect",
    icon: "Wallet",
    color: "green",
    summary:
      "Use turns to collect cash from your businesses — casinos, brothels, loan sharks, and gambling dens.",
    content: `
<p>You can also use turns to collect cash from your businesses. You own casinos, brothels, loan sharks and gambling dens.</p>

<ol>
  <li><strong>Card dealers</strong> are used to run your casino tables.</li>
  <li><strong>Whores</strong> are used to work in your brothels.</li>
  <li><strong>Hustlers</strong> are used to collect loan payments in your loan shark offices.</li>
  <li><strong>Punks</strong> are used to run your gambling dens.</li>
</ol>`,
    tips: [
      "Always check your operatives' happiness BEFORE collecting — collecting with unhappy operatives wastes turns.",
      "Collect, then bank immediately. Never walk around with loose cash.",
      "Focus on one or two operative types rather than spreading thin.",
    ],
    order: 12,
  },
  {
    id: "cash-and-the-bank",
    title: "Cash And The Bank",
    icon: "Landmark",
    color: "cyan",
    summary:
      "Deposit up to 75% of your money in the bank to keep it safe from attacks. The remaining 25% is always at risk.",
    content: `
<p>Just like the real world, you have a bank account as well as the money in your pocket. However, keeping money in your pocket is risky. Other players can attack you and take whatever you have. So, depositing a part of it in the bank might be a good idea.</p>

<p>You are able to deposit up to <strong>75%</strong> of your money into the bank, or your personal safebox and <strong>25%</strong> is kept loose.</p>

<p>Later, if you want to add more money in to the bank, you can deposit 75% of all the total cash you currently have. You can withdraw it all when you need it at anytime for free. <strong>You cannot transfer cash to another player.</strong></p>`,
    tips: [
      "Develop a collect → bank → scout → collect rhythm. Never leave large amounts of cash sitting unbanked.",
      "The 75% limit means you'll always have some loose cash — use strong defensive units to protect what can't be banked.",
      "If you know you're about to be attacked, try to bank right before to minimize losses.",
    ],
    order: 13,
  },
  {
    id: "attacking",
    title: "Attacking",
    icon: "Swords",
    color: "rose",
    summary:
      "Attack players within your networth range. Choose from 7 different attack types — from drive-bys to stealing planes.",
    content: `
<p>To attack a player, go to the Attack screen and click on the link of the player you wish to attack. You can also attack directly from their profile screen. When you are viewing their profile, click on attack. If you see "Out of Range" instead of "Attack", you cannot attack that player.</p>

<p>You can only attack players between <strong>1/2 to 4 times</strong> your net worth. TheMafiaBoss will automatically take your best crew members armed with the best weapons in order to have the most efficient attack possible.</p>

<p>There is a limit to the amount of times a player can be hit. The maxing system works as follows: Maxing is based on a certain % of networth taken in an hour, every hour according to the game rules setting.</p>

<p><strong>Revenge attacks:</strong> You can take revenge on any player who has attacked you as follows:</p>
<ul>
  <li>Revenges through business, if it was attacked, and drive-bys for 24 hours.</li>
  <li>If the player is unmaxed and out of range, revenge by drive by only.</li>
  <li>If the player is in range you can attack normally until maxed then revenge by drive by only.</li>
  <li>KPs are awarded from Revenge attacks.</li>
</ul>

<p><span class="text-red-400">**If YOUR Operatives were attacked, you have Revenge on that player's Business/Operatives, for 24 hours revenge duration and every time you have a revenge on them you will be able to also revenge their ops [even if they are maxed] at 5% per hour. [for the entire round]</span></p>

<p><strong>There are 7 different types of attacks:</strong></p>

<ol>
  <li><strong>Drive-by</strong> — This attack inflicts more damage than any other, so it can be used to quickly kill an opponent if you have enough cars. You do not steal any cash, guns, drugs, planes or cars during this attack. You attack with as many people as your cars can carry. More battle trophies are stolen through this method of attack.</li>
  <li><strong>Run up in Headquarters</strong> — Invade your enemy's headquarters and whack their defensive units. You steal money if you win the attack.</li>
  <li><strong>Extort Business</strong> — Invade your enemy's businesses and whack their defensive units AND operatives (if you win the attack).</li>
  <li><strong>Attack Armory</strong> — Invade your enemy's armory. You kill their defensive units, and steal guns if you win the attack.</li>
  <li><strong>Sabotage Drug Labs</strong> — You kill their defensive units and steal drugs from your opponent if you win.</li>
  <li><strong>Steal planes</strong> — In order to steal someone's planes, you need to make sure all of their defensive units are dead. You can only steal planes if you have enough planes and defensive units.</li>
  <li><strong>Jack cars</strong> — In order to steal someone's car, you need to make sure all of their defensive units are dead and that you own enough cars.</li>
</ol>`,
    tips: [
      "Always scout your target before attacking — check their defensive units and happiness.",
      "Use drive-bys to weaken strong targets before going for resource theft.",
      "Sabotaging drug labs is devastating long-term — unhappy crews produce less and may desert.",
      "Stay within your attack range. Attacking someone at 4x your networth is risky.",
    ],
    order: 14,
  },
  {
    id: "revenge",
    title: "Revenge",
    icon: "Flame",
    color: "orange",
    summary:
      "You have 24 hours to take revenge on anyone who attacks you. Unlimited drive-by hits during the revenge window.",
    content: `
<p>You are allowed to take revenge attacks on any player that has attacked you, within a <strong>24 hour period</strong> of the attack occurring. You will have unlimited hits open via drive bye attacks on their defensive units and also open revenge on the Business/Operatives if your business was attacked.</p>

<p>Be careful though, as once you take revenge, that player will have revenge on you.</p>

<ul>
  <li>If the player is unmaxed and out of range, you can hit until the player is maxed then revenge by drive by only.</li>
  <li>Revenge attacks kills do not add to your kill counter.</li>
  <li><span class="text-red-400">If YOUR Operatives were attacked, you have Revenge on that player's Business/Operatives, for 24 hours revenge duration and every time you have a revenge on them you will be able to also revenge their ops [even if they are maxed] at 5% per hour. [for the entire round]</span></li>
</ul>`,
    tips: [
      "Use your revenge window wisely — it's one of the few times you can hit someone who's out of your normal range.",
      "Be strategic about revenge: sometimes it's better not to retaliate if it opens you up to counter-revenge.",
      "Revenge drive-bys are unlimited — use them to cripple an attacker's defensive units before they can rebuild.",
    ],
    order: 15,
  },
  {
    id: "travel",
    title: "Travel",
    icon: "MapPin",
    color: "sky",
    summary:
      "Travel between cities to escape enemies, hunt targets, or return to your family's home turf.",
    content: `
<p>Traveling is used for different purposes, such as running away from someone that is trying to kill you, moving to another city in order to kill someone, or traveling to and from the city where your family is located.</p>

<p>Being in your own city has pros and cons. A pro is that your family offers you <strong>more protection</strong> in your hometown; a con is that it's <strong>easier for your enemies to find you</strong>.</p>`,
    tips: [
      "If you're being targeted, traveling to another city can buy you time to rebuild.",
      "Being in your family's city gives you backup — but also makes you easier to locate.",
      "Planes let you travel without buying tickets — invest in them if you move between cities frequently.",
    ],
    order: 16,
  },
  {
    id: "medals",
    title: "Medals",
    icon: "Trophy",
    color: "amber",
    summary:
      "Earn medals by ranking in the top 3 of your level. Player levels are determined by credits added to the round.",
    content: `
<p><strong>Top Runner Medals</strong> are distributed to the 3 players with the highest net worth in each level. Player level is determined by the amount of credits added to a particular round, or the purchase of a subscription package. They are as follows:</p>

<ol>
  <li><strong>Level 1:</strong> 0 - 999 won or purchased credits added.</li>
  <li><strong>Level 2:</strong> 1,000 - 24,999 won or purchased credits added, and/or purchase of Titanium subscription.</li>
  <li><strong>Level 3:</strong> 25,000 - 99,999 won or purchased credits added, and/or purchase of Titanium Black subscription.</li>
  <li><strong>Level 4:</strong> Anything beyond 100,000 won or purchased credits added, and/or purchase of Diamond subscription.</li>
</ol>

<p>Bonus Reserves do not adjust Player Level.</p>

<p><strong>Family Collector Medals</strong> are given to the 3 families with the highest family networth.</p>
<p><strong>Family Killer Medals</strong> are given to the 3 families with the highest family kill counts.</p>`,
    tips: [
      "Focus on competing within your level — you don't need to be the richest player overall, just the richest in your bracket.",
      "Family medals contribute to your family's reputation — work together to earn them.",
      "Bonus reserves don't change your level, so use them freely without worrying about moving to a harder bracket.",
    ],
    order: 17,
  },
  {
    id: "protection-program",
    title: "Protection Program",
    icon: "ShieldCheck",
    color: "green",
    summary:
      "All new players start with 24 hours of protection from attacks. Use this time to learn the game safely.",
    content: `
<p>All players that join the game start under <strong>Protection Program</strong> for the first 24 Hours Only. Protection Program allows players to learn the game while they are protected from other players attacks.</p>

<p>Also players under Protection Program do not have access to Transfers, Attacks and Travel section. Here are the 24 Hour Protection Program details:</p>

<ul>
  <li><strong>Attack:</strong> Protected Players cannot be attacked. Protected Players cannot attack other players.</li>
  <li><strong>Bank:</strong> Protected Players cannot transfer money. Protected Players cannot receive transfers.</li>
  <li><strong>Travel:</strong> Protected Players cannot travel to another city.</li>
  <li><strong>Ranks:</strong> Protected Players do not have a Rank.</li>
  <li><strong>Hire:</strong> Protected Players cannot use more than 5,000 turns in total scouting.</li>
  <li><strong>Collect:</strong> Protected Players cannot use more than 5,000 turns in total collecting.</li>
  <li><strong>Produce:</strong> Protected Players cannot use more than 5,000 turns in total producing.</li>
</ul>`,
    tips: [
      "Use your 24-hour protection window to scout as many operatives and defensive units as possible.",
      "Don't waste your protection time — every turn spent scouting now pays dividends later.",
      "Bank your collected cash during protection so it's safe when your protection expires.",
    ],
    order: 18,
  },
  {
    id: "mafiagods",
    title: "Mafiagods",
    icon: "Crown",
    color: "violet",
    summary:
      "The Mafiagods — Admins, Mods, and Helpers — monitor the game and ensure fair play. Stay on their good side.",
    content: `
<p>These staff members include the <strong>Admins, Mods and Helpers</strong>. They monitor the game and make sure everyone is playing fair. It's best to stay on the MafiaGods' good side.</p>

<p>If you have any problems, come across a bug in the game or have found a game abuser, let them know by sending any one of them a message (preferably to the staff member(s) currently online; the rest are probably sleeping or out buying a new set of steak knives).</p>

<p>You can also use the <strong>mafiosogods board</strong> to alert the staff to any of the above situations. Posting on the mafiosogods board is the <strong>ONLY way</strong> to request compensation if you have been attacked by a player who was subsequently removed from the game.</p>`,
    tips: [
      "If you find a bug or game abuser, report it to the Mafiagods — it keeps the game fair for everyone.",
      "Use the mafiosogods board for compensation requests — it's the only official channel.",
      "Stay on the good side of staff — they have the power to remove rule-breakers from the game.",
    ],
    order: 19,
  },
];
