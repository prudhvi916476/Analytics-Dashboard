import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg"

// CountUp Hook from KpiCard
function useCountUp(target: number, duration: number = 1200) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    startTimeRef.current = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current!;
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
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
  }, [target, duration]);

  return current;
}

interface BentoCardProps {
  title: string
  value: number | string
  format?: (val: number) => string
  prefix?: string
  suffix?: string
  subtitle?: string
  icon?: React.ElementType
  colors: string[]
  delay: number
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  format,
  prefix = '',
  suffix = '',
  subtitle,
  icon: Icon,
  colors,
  delay,
}) => {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);
  const displayValue = typeof value === 'number' 
    ? (format ? format(animatedValue) : animatedValue.toLocaleString())
    : value;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Rounded corners and border styling to match glassmorphic KpiCard
  return (
    <motion.div
      className="relative overflow-hidden h-full min-h-[140px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,40,0.55)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:border-[rgba(255,255,255,0.15)] transition-shadow duration-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />
      <motion.div
        className="relative z-10 p-5 md:p-6 text-[#f0f4ff] h-full flex flex-col justify-between"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h3 
            className="text-sm sm:text-base font-medium text-[#7b8db5]" 
            variants={item}
          >
            {title}
          </motion.h3>
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
              <Icon size={20} style={{ color: colors[0] }} />
            </div>
          )}
        </div>

        <div>
          <motion.p
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#f0f4ff]"
            variants={item}
            style={{ fontFamily: "Outfit, Inter, sans-serif" }}
          >
            {prefix}{displayValue}{suffix}
          </motion.p>
          {subtitle && (
            <motion.p 
              className="text-xs sm:text-sm text-[#7b8db5] mt-2" 
              variants={item}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export { BentoCard }
