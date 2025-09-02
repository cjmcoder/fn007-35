export type SupportFaqItem = {
  qId: string;
  q: string;
  a: string;
};

export type SupportFaqSection = {
  slug: string;
  title: string;
  items: SupportFaqItem[];
};

export interface SupportFaqData {
  lastUpdated: string;
  brand: string;
  sections: SupportFaqSection[];
  disclaimer: string;
}

export const supportFaq: SupportFaqData = {
  lastUpdated: "2025-08-12",
  brand: "FLOCKNODE",
  sections: [
    {
      slug: "reporting-results-and-cancellations",
      title: "Reporting Results & Cancellations",
      items: [
        {
          qId: "rr-1",
          q: "How long does it take to verify a reported result?",
          a: "If **both players** report the same winner, verification is instant and the entry is released automatically. If reports **don’t match**, the match enters review and is resolved within **24 hours** (often much faster) after evidence is submitted."
        },
        {
          qId: "rr-2",
          q: "What happens if a match is not reported?",
          a: "If neither player reports a result within **24 hours** of the scheduled start time, the match is **voided** and entries are returned to both players. Repeated non-reporting may lower your **trust score** and restrict future entries."
        },
        {
          qId: "rr-3",
          q: "Can I cancel after creating or joining a challenge?",
          a: "You can cancel **before check-in**. After check-in, cancellation is only allowed if your opponent **no-shows** after a **10-minute** grace period. Open a *No-Show* ticket from the match page and upload proof (lobby screen, timestamp)."
        },
        {
          qId: "rr-4",
          q: "What evidence is accepted for results?",
          a: "Clear **scoreboard screenshots**, short **video clips**, or a **public stream VOD** showing the match ID and final score. For EA titles, include the **match ID in your stream title** as instructed."
        },
        {
          qId: "rr-5",
          q: "What if my opponent reports the wrong score?",
          a: "Open a dispute within **2 hours** of their report and attach evidence. If neither side provides proof, the match is **voided** with entries returned."
        }
      ]
    },
    {
      slug: "code-of-conduct",
      title: "Code of Conduct",
      items: [
        {
          qId: "coc-1",
          q: "What behavior is prohibited?",
          a: "Harassment, hate speech, threats, doxxing, match-fixing, collusion, stream sniping, and any form of cheating or exploiting bugs. Keep chat and DMs respectful."
        },
        {
          qId: "coc-2",
          q: "Multiple accounts and impersonation",
          a: "One account per person. Account sharing or impersonating another player leads to **account closure** and **forfeiture** of entries."
        },
        {
          qId: "coc-3",
          q: "Sanctions",
          a: "We use progressive discipline: **warning → 24h suspension → 7d suspension → permanent ban**. Severe violations may result in **immediate permanent ban**."
        },
        {
          qId: "coc-4",
          q: "Cheats, macros, and hardware mods",
          a: "Any third-party tool or hardware giving an unfair advantage is banned. For PC titles with anti-cheat, you must comply fully. For console, external devices that alter input timing are prohibited."
        },
        {
          qId: "coc-5",
          q: "Stream requirements for certain games",
          a: "For **EA titles** and other listed games, you must **stream publicly** with the **match ID in the title** and keep the VOD for **72 hours**."
        }
      ]
    },
    {
      slug: "general-rules",
      title: "General Rules",
      items: [
        {
          qId: "gr-1",
          q: "Match setup and pre-game rules",
          a: "All required settings (platform, region, game mode, stamina, difficulty, time, etc.) must be in the challenge details. **Only listed rules are enforceable.**"
        },
        {
          qId: "gr-2",
          q: "Eligibility and age",
          a: "You must be **18+** (or the age of majority in your jurisdiction) and **not located** in regions where real-money skill contests are restricted. We may require **KYC** before payouts."
        },
        {
          qId: "gr-3",
          q: "Proof guidelines",
          a: "Always capture the **final scoreboard** and, if possible, record a short **clip**. For required-stream titles, ensure the **match ID** is visible."
        },
        {
          qId: "gr-4",
          q: "Timing and lateness",
          a: "There is a **10-minute** grace period from scheduled start. After that, the waiting player can claim **No-Show** with proof."
        },
        {
          qId: "gr-5",
          q: "Private servers for ranked/high-stakes",
          a: "VIP matches may use FLOCKNODE-hosted servers. Server settings must match the challenge. Abusing admin tools results in forfeit."
        }
      ]
    },
    {
      slug: "disputes",
      title: "Disputes",
      items: [
        {
          qId: "dp-1",
          q: "Where do I file a dispute?",
          a: "From the match page, click **Open Dispute**. Submit within **2 hours** of result report and include evidence."
        },
        {
          qId: "dp-2",
          q: "What if I have no evidence?",
          a: "We decide based on available proof. If neither side provides evidence, the match is **voided** and entries returned."
        },
        {
          qId: "dp-3",
          q: "False reports & abuse",
          a: "Knowingly submitting false evidence can result in **suspension** or **ban**."
        },
        {
          qId: "dp-4",
          q: "Appeals",
          a: "Referee decisions are **final** for match outcomes. You may appeal **account sanctions** within **7 days** via Support."
        },
        {
          qId: "dp-5",
          q: "Response time",
          a: "Most disputes resolve within **24 hours**. Complex cases may take longer; we’ll keep you updated in the ticket."
        }
      ]
    },
    {
      slug: "disconnections",
      title: "Disconnections",
      items: [
        {
          qId: "dc-1",
          q: "If a disconnect happens early",
          a: "Before **25%** of regulation time: **restart** with the same settings."
        },
        {
          qId: "dc-2",
          q: "If a disconnect happens late",
          a: "After **75%** of regulation time: the **leading player** may claim the win with proof of score at disconnect. Otherwise, restart."
        },
        {
          qId: "dc-3",
          q: "Repeated disconnects",
          a: "Two or more disconnects by the same player in one match can be ruled **forfeit** at referee discretion."
        },
        {
          qId: "dc-4",
          q: "Lag & server region",
          a: "Select the **closest region** available. Severe, consistent lag documented by both players may lead to **void** and rematch."
        },
        {
          qId: "dc-5",
          q: "Intentional quitting",
          a: "Quitting to avoid a loss is **forfeit** and may trigger account penalties."
        }
      ]
    },
    {
      slug: "side-challenges",
      title: "Side Challenges & Private Server Requirements",
      items: [
        {
          qId: "sc-1",
          q: "What are Side Challenges?",
          a: "Side Challenges are optional peer-to-peer prop bets that can only be created on **Private Server matches**. They allow players to bet on specific in-game statistics and performance metrics."
        },
        {
          qId: "sc-2",
          q: "Private Server requirement",
          a: "Side Challenges are **limited to Private Server matches only**. If a match is not marked as a Private Server match, you cannot create or join any Side Challenge. You'll see the error: *Side Challenges are limited to Private Server matches.*"
        },
        {
          qId: "sc-3",
          q: "Minimum stake requirements",
          a: "The minimum stake per player for any Side Challenge is **25 FC**. Entries below this threshold will be rejected with the error: *Entry must be at least 25 FC per player.*"
        },
        {
          qId: "sc-4",
          q: "Private Server usage fees",
          a: "There is a **2 FC per player** non-refundable Private Server usage fee. This fee is charged when you create or join a challenge on a Private Server match that transitions to LIVE status."
        },
        {
          qId: "sc-5",
          q: "When are Private Server fees charged?",
          a: "The 2 FC fee is charged separately from your entry escrow when the match goes from OPEN→LOCKED→LIVE. If a match is canceled before going LIVE, the fee is refunded. Once LIVE, the fee is non-refundable."
        },
        {
          qId: "sc-6",
          q: "Fee transaction tracking",
          a: "Private Server fees appear as separate transactions in your account with type **PRIVATE_SERVER_FEE** for transparency and tracking purposes."
        }
      ]
    },
    {
      slug: "entries-and-payouts",
      title: "Entries & Payouts (Skill-Based)",
      items: [
        {
          qId: "ep-1",
          q: "How do entries work?",
          a: "When a challenge is created and joined, both players’ **entries** are **escrowed** until the match is verified."
        },
        {
          qId: "ep-2",
          q: "Side challenges (skill props)",
          a: "Optional **side challenges** are peer-to-peer and not house-banked. They settle when the related stat is verified."
        },
        {
          qId: "ep-3",
          q: "Payout timing",
          a: "Instant on dual confirmation; up to **24 hours** if a review is needed."
        },
        {
          qId: "ep-4",
          q: "Fees",
          a: "Platform commission is **5–10%** of the total entry pool depending on tier."
        },
        {
          qId: "ep-5",
          q: "FC balance",
          a: "**FC** is an **off-chain**, internal balance for rewards and entries. It is **not a cryptocurrency**. Conversions, if offered, will be clearly disclosed."
        }
      ]
    },
    {
      slug: "account-and-security",
      title: "Account & Security",
      items: [
        {
          qId: "as-1",
          q: "Linking gamertags",
          a: "Link your PSN/Xbox/Steam IDs in **Settings → Accounts**. Use the same ID in matches; mismatches can cause forfeits."
        },
        {
          qId: "as-2",
          q: "KYC and withdrawals",
          a: "We may require **KYC** before first withdrawal or for risk review. Incomplete KYC can delay payouts."
        },
        {
          qId: "as-3",
          q: "Security best practices",
          a: "Enable **2FA**, use a unique password, and don’t share your account. We log suspicious sessions for your safety."
        },
        {
          qId: "as-4",
          q: "Privacy",
          a: "See our **Privacy Policy** for how we handle data, streams, and match evidence."
        },
        {
          qId: "as-5",
          q: "Jurisdiction limits",
          a: "Real-money skill contests are restricted in some locations. We enforce **geo-rules** to remain compliant."
        }
      ]
    },
    {
      slug: "tournament-limits",
      title: "Tournaments & Limits",
      items: [
        {
          qId: "tl-1",
          q: "Daily limits",
          a: "We may cap entries or prize totals per day to prevent abuse and comply with local rules."
        },
        {
          qId: "tl-2",
          q: "Check-in and seeding",
          a: "Players must **check in** before start; late arrivals may be replaced. Seeding is based on ranking and recent results."
        },
        {
          qId: "tl-3",
          q: "Ties and overtime",
          a: "Follow the game’s standard overtime rules unless the bracket specifies otherwise."
        },
        {
          qId: "tl-4",
          q: "Collusion",
          a: "Arranging outcomes or splitting prizes is forbidden and leads to **DQ** and sanctions."
        },
        {
          qId: "tl-5",
          q: "Contacting admins",
          a: "Use the **Tournament Chat** or **Admin Ticket** from your bracket page for help."
        }
      ]
    },
    {
      slug: "leaderboard-terms",
      title: "📊 Leaderboard Terms & Regulations",
      items: [
        {
          qId: "lb-1",
          q: "Who is eligible for leaderboard ranking?",
          a: "Only **verified accounts in good standing** are eligible. Matches must be verified through our tracking system to count. Accounts flagged for **collusion, smurfing, or cheating** will be removed and may face suspension."
        },
        {
          qId: "lb-2", 
          q: "How are leaderboard rankings calculated?",
          a: "Rankings reset **weekly every Monday at 12:00 AM UTC** and are determined by: **Match wins/losses**, **Opponent strength (ELO/rating-based)**, and **Tournament participation**. Ties are broken by head-to-head record, match differential, then admin review."
        },
        {
          qId: "lb-3",
          q: "What are the weekly leaderboard rewards?",
          a: "Only **Top 15 players** receive FC rewards each week: 🥇 **Rank 1: 150 FC** | 🥈 **Ranks 2–3: 100 FC** | 🏅 **Ranks 4–10: 50 FC** | 🎖 **Ranks 11–15: 25 FC**. All others remain eligible for **FNC performance rewards** based on match participation."
        },
        {
          qId: "lb-4",
          q: "What are the minimum match requirements?",
          a: "Players must complete **minimum 5 verified matches per week** to remain eligible for rewards. **Inactivity** results in automatic removal from rewards (though rank history is logged). **Forfeits, disconnects, or incomplete matches** don't count."
        },
        {
          qId: "lb-5",
          q: "What conduct rules apply to leaderboards?",
          a: "**Unsportsmanlike conduct** (abuse, spam, harassment) may result in point deductions or disqualification. **Match-fixing, collusion, or farming** will result in account review with possible bans and prize forfeiture. We reserve the right to adjust standings for detected abuse."
        },
        {
          qId: "lb-6",
          q: "How do I dispute leaderboard standings?",
          a: "File disputes **within 24 hours** of leaderboard reset with **evidence** (screenshots, replays, VODs). Admin decisions are **final** to preserve integrity. We may update rules, prize structures, or eligibility requirements with advance notice."
        }
      ]
    }
  ],
  disclaimer:
    "FLOCKNODE hosts **skill-based** competitions. This page provides rules and guidance and is not legal advice. Local eligibility restrictions apply."
};
