"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './KpiCard.module.css';

function useCountUp(target, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    startTimeRef.current = performance.now();
    
    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

export default function KpiCard({ title, value, format, icon: Icon, prefix = '', suffix = '', color = '#60a5fa', delay = 0 }) {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);
  const displayValue = format ? format(animatedValue) : animatedValue.toLocaleString();

  return (
    <div 
      className={styles.card} 
      style={{ 
        '--card-accent': color,
        animationDelay: `${delay}s`
      }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {Icon && (
          <div className={styles.iconContainer}>
            <Icon className={styles.icon} size={20} style={{ color }} />
          </div>
        )}
      </div>
      <div className={styles.valueContainer}>
        <span className={styles.value}>
          {prefix}{displayValue}{suffix}
        </span>
      </div>
    </div>
  );
}
