"use client";
import { useEffect, useState, useRef } from "react";

/** Props for the StatCounter component */
interface StatCounterProps {
  /** The target number to animate towards */
  target: number;
  /** Optional suffix appended after the number (e.g., "+", " Cr+") */
  suffix?: string;
}

/**
 * Animated counter component that counts from 0 to a target value
 * when the element enters the viewport. Uses IntersectionObserver
 * for efficient scroll-based triggering.
 *
 * The animation runs once and uses a step-based interval for smooth counting.
 *
 * @param {StatCounterProps} props - Component props.
 * @returns {React.ReactElement} The rendered animated counter.
 *
 * @example
 * ```tsx
 * <StatCounter target={543} suffix="+" />
 * ```
 */
export function StatCounter({ target, suffix = "" }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const step = Math.max(1, Math.floor(target / 40));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 25);
        }
      },
      { threshold: 0.3 },
    );
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      observer.disconnect();
    };
  }, [target]);

  return (
    <span
      ref={ref}
      className="text-2xl sm:text-3xl font-extrabold gradient-text tabular-nums"
      data-testid="stat-counter"
      aria-label={`${target.toLocaleString()}${suffix}`}
      role="text"
    >
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
