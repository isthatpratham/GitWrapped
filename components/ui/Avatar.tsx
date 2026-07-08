"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { User } from "@/components/icons";

interface AvatarProps {
  readonly src?: string | null;
  readonly alt?: string;
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly className?: string;
}

export function Avatar({ src, alt = "Profile image", size = "md", className }: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const showFallback = !src || error;

  return (
    <div
      className={clsx(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-surface border border-border select-none shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {showFallback ? (
        <User className="h-1/2 w-1/2 text-muted-foreground" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
