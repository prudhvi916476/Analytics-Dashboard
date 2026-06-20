"use client";

import styles from './Gamification.module.css';

// ── Rank tiers based on average order value ──
const RANKS = [
  { name: "Bronze",   emoji: "🥉", minAov: 0,    color: "#cd7f32", rgb: "205,127,50"  },
  { name: "Silver",   emoji: "🥈", minAov: 200,   color: "#c0c0c0", rgb: "192,192,192" },
  { name: "Gold",     emoji: "🥇", minAov: 400,   color: "#fbbf24", rgb: "251,191,36"  },
  { name: "Platinum", emoji: "💎", minAov: 600,   color: "#a78bfa", rgb: "167,139,250" },
  { name: "Diamond",  emoji: "👑", minAov: 800,   color: "#22d3ee", rgb: "34,211,238"  },
];

// ── XP milestones (revenue-based) ──
const XP_MILESTONES = [
  { label: "₹100K",  value: 100000 },
  { label: "₹500K",  value: 500000 },
  { label: "₹10L",   value: 1000000 },
  { label: "₹25L",   value: 2500000 },
  { label: "₹50L",   value: 5000000 },
  { label: "₹1Cr",   value: 10000000 },
  { label: "₹5Cr",   value: 50000000 },
  { label: "₹10Cr",  value: 100000000 },
];

// ── Achievement definitions ──
const ACHIEVEMENTS = [
  {
    id: "revenue_king",
    emoji: "🏆",
    name: "Revenue King",
    desc: "Total revenue exceeds ₹1,00,000",
    check: (kpis) => (kpis.totalRevenue || 0) > 100000,
    progress: (kpis) => Math.min(100, ((kpis.totalRevenue || 0) / 100000) * 100),
  },
  {
    id: "order_machine",
    emoji: "📦",
    name: "Order Machine",
    desc: "More than 500 orders processed",
    check: (kpis) => (kpis.totalOrders || 0) > 500,
    progress: (kpis) => Math.min(100, ((kpis.totalOrders || 0) / 500) * 100),
  },
  {
    id: "high_roller",
    emoji: "⭐",
    name: "High Roller",
    desc: "Average order value exceeds ₹500",
    check: (kpis) => (kpis.averageOrderValue || 0) > 500,
    progress: (kpis) => Math.min(100, ((kpis.averageOrderValue || 0) / 500) * 100),
  },
  {
    id: "item_blaster",
    emoji: "🔥",
    name: "Item Blaster",
    desc: "More than 5,000 items sold",
    check: (kpis) => (kpis.totalItems || 0) > 5000,
    progress: (kpis) => Math.min(100, ((kpis.totalItems || 0) / 5000) * 100),
  },
];

function getRank(aov) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (aov >= r.minAov) rank = r;
  }
  return rank;
}

function getXpMilestone(revenue) {
  for (const m of XP_MILESTONES) {
    if (revenue < m.value) return m;
  }
  return XP_MILESTONES[XP_MILESTONES.length - 1];
}

function getPrevMilestone(revenue) {
  let prev = { label: "₹0", value: 0 };
  for (const m of XP_MILESTONES) {
    if (revenue < m.value) return prev;
    prev = m;
  }
  return prev;
}

export default function Gamification({ kpis }) {
  const aov = kpis.averageOrderValue || 0;
  const revenue = kpis.totalRevenue || 0;
  const rank = getRank(aov);
  const nextMilestone = getXpMilestone(revenue);
  const prevMilestone = getPrevMilestone(revenue);
  
  const xpRange = nextMilestone.value - prevMilestone.value;
  const xpProgress = xpRange > 0 
    ? Math.min(100, ((revenue - prevMilestone.value) / xpRange) * 100)
    : 100;

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(kpis)).length;

  return (
    <div className={styles.gamificationSection}>
      <div className={styles.gamificationGrid}>
        {/* Rank Card */}
        <div 
          className={styles.rankCard} 
          style={{ '--rank-color': rank.color, '--rank-rgb': rank.rgb }}
        >
          <div className={styles.rankBadge}>
            {rank.emoji}
          </div>
          <div>
            <div className={styles.rankTitle}>{rank.name} Rank</div>
            <div className={styles.rankSubtitle}>
              Based on avg order value • ₹{aov.toFixed(0)}
            </div>
          </div>

          {/* XP Bar */}
          <div className={styles.xpSection}>
            <div className={styles.xpLabelRow}>
              <span className={styles.xpLabel}>Revenue XP</span>
              <span className={styles.xpValue}>{xpProgress.toFixed(0)}%</span>
            </div>
            <div className={styles.xpBarOuter}>
              <div 
                className={styles.xpBarInner} 
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className={styles.xpMilestone}>
              Next: {nextMilestone.label}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.achievementsCard}>
          <div className={styles.achievementsTitle}>
            🎯 Achievements ({unlockedCount}/{ACHIEVEMENTS.length})
          </div>
          <div className={styles.badgeGrid}>
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = achievement.check(kpis);
              const progress = achievement.progress(kpis);
              return (
                <div 
                  key={achievement.id}
                  className={`${styles.badge} ${isUnlocked ? styles.unlocked : styles.locked}`}
                >
                  <div className={styles.badgeEmoji}>{achievement.emoji}</div>
                  <div className={styles.badgeInfo}>
                    <span className={styles.badgeName}>{achievement.name}</span>
                    <span className={styles.badgeDesc}>{achievement.desc}</span>
                    <span className={`${styles.badgeStatus} ${isUnlocked ? styles.achieved : styles.inProgress}`}>
                      {isUnlocked ? '✓ Achieved' : `${progress.toFixed(0)}% complete`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
