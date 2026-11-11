import React, { useEffect, useState, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  from?: number;
  duration?: number; // Total animation duration in ms (default: 1300ms)
  delay?: number; // Delay before animation begins (default: 0ms)
  decimals?: number; // Number of decimal places (default: 0)
  prefix?: string; // String prepended to the number (e.g. '$', '₹', '+')
  suffix?: string; // String appended to the number (e.g. '%', ' vs last month')
  formatter?: (val: number) => string; // Optional custom formatter function
  className?: string; // Additional Tailwind / CSS classes
  triggerKey?: any; // Re-runs animation whenever this value changes (e.g. activeTab)
}

/**
 * AnimatedCounter
 * Smoothly animates any numeric value from 0 (or a custom start) to the target number
 * using high-performance requestAnimationFrame with an ease-out quartic curve.
 * Guarantees zero layout shift with tabular figures.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  from = 0,
  duration = 1300,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
  triggerKey,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(from);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset to initial 'from' value
    setDisplayValue(from);

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const startCounting = () => {
      startTimeRef.current = null;

      const step = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out Quartic: 1 - (1 - progress)^4
        // Snappy initial spin, ultra-smooth graceful deceleration
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = from + (value - from) * ease;

        if (progress < 1) {
          setDisplayValue(current);
          frameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(startCounting, delay);
    } else {
      startCounting();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, from, duration, delay, triggerKey]);

  // Format the output
  let formattedNumber: string;
  if (formatter) {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(displayValue * factor) / factor;
    formattedNumber = formatter(rounded);
  } else {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(displayValue * factor) / factor;
    formattedNumber = rounded.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return (
    <span className={`tabular-nums inline-block tracking-tight font-variant-numeric:tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
