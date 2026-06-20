"use client";

import { BarChart3, Sparkles, SlidersHorizontal, ArrowRight, BarChart2, Bot, Zap } from "lucide-react";
import styles from "../app/landing.module.css";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Interactive charts and KPIs that update instantly as you filter by outlet and date range.",
    color: "#22d3ee",
    delay: 0.2
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    desc: "Generate intelligent business summaries with one click using Gemini AI analysis.",
    color: "#a78bfa",
    delay: 0.35
  },
  {
    icon: SlidersHorizontal,
    title: "Smart Filters",
    desc: "Drill down by outlet, date range, and category to discover hidden trends in your data.",
    color: "#fb7185",
    delay: 0.5
  }
];

export default function LandingPage({ onEnter }) {
  return (
    <div className={styles.landingWrapper}>
      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>

          Analytics Dashboard
        </div>

        <h1 className={styles.heroTitle}>
          Unlock the Power of{" "}
          Your Business Data
        </h1>

        <p className={styles.heroSubtitle}>
          Dive into real-time revenue analytics, AI-powered insights, and
          intelligent performance tracking — all in one stunning dashboard.
        </p>

        <button className={styles.ctaButton} onClick={onEnter} id="enter-dashboard-btn">
          Enter Dashboard
          <ArrowRight size={20} className={styles.ctaArrow} />
        </button>
      </section>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ display: 'flex', justifyContent: 'center', color: '#22d3ee' }}><BarChart2 size={28} /></span>
          <span className={styles.statLabel}>Real-time Data</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ display: 'flex', justifyContent: 'center', color: '#a78bfa' }}><Bot size={28} /></span>
          <span className={styles.statLabel}>AI-Powered</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ display: 'flex', justifyContent: 'center', color: '#fb7185' }}><Zap size={28} /></span>
          <span className={styles.statLabel}>Lightning Fast</span>
        </div>
      </div>

      {/* Feature cards */}
      <div className={styles.featuresGrid}>
        {features.map((f, i) => (
          <div
            key={f.title}
            className={styles.featureCard}
            style={{ '--card-accent': f.color, animationDelay: `${f.delay}s` }}
          >
            <div className={styles.featureIcon}>
              <f.icon size={24} style={{ color: f.color }} />
            </div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
