"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface TooltipProps {
  readonly children: React.ReactNode;
  readonly content: string;
  readonly position?: "top" | "bottom" | "left" | "right";
  readonly className?: string;
}

export function Tooltip({ children, content, position = "top", className }: TooltipProps) {
  const [active, setActive] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
      {active && (
        <div
          role="tooltip"
          className={clsx(
            "absolute z-tooltip px-2.5 py-1.5 bg-surface border border-border text-foreground text-xs font-sans font-medium rounded shadow-xl whitespace-nowrap pointer-events-none animate-fade",
            positionClasses[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
