import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  delay?: number;
}

const AnimatedStat = ({ value, suffix, label, delay = 0 }: StatProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center p-6"
    >
      <div className="font-mono text-3xl md:text-4xl font-bold text-gradient mb-2">
        {formatNumber(count)}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

const StatsCounter = () => {
  const stats = [
    { value: 14203, suffix: '', label: 'Active Connections' },
    { value: 1.2, suffix: 'B', label: 'Tokens Processed' },
    { value: 99.99, suffix: '%', label: 'Uptime SLA' },
    { value: 12, suffix: 'ms', label: 'Avg Latency' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-glass">
      {stats.map((stat, index) => (
        <AnimatedStat
          key={stat.label}
          {...stat}
          delay={index * 150}
        />
      ))}
    </div>
  );
};

export default StatsCounter;
