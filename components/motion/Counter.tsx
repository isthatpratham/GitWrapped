"use client";

import React, { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface CounterProps {
  readonly value: number;
  readonly className?: string;
  readonly delay?: number; // in seconds
  readonly duration?: number; // in seconds
  readonly format?: (val: number) => string;
}

const defaultFormat = (val: number) => Math.floor(val).toLocaleString();

export function Counter({
  value,
  className,
  delay = 0.2,
  duration = 1.2,
  format = defaultFormat,
}: CounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (reduced) {
      node.textContent = format(value);
      return;
    }

    // Wait for the specified delay before starting animation
    const timeout = setTimeout(() => {
      const controls = animate(0, value, {
        duration,
        ease: "easeOut",
        onUpdate(latest) {
          node.textContent = format(latest);
        },
      });

      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, delay, duration, format, reduced]);

  return <span ref={nodeRef} className={className}>0</span>;
}
