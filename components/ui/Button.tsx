"use client";

import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Component: Button
// ---------------------------------------------------------------------------
// A premium button component built with Framer Motion for subtle hover lift
// and click compression, Montserrat typography, and focus ring accessibility.
// ---------------------------------------------------------------------------

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyle =
      "inline-flex items-center justify-center font-sans font-semibold tracking-wide rounded-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
      secondary: "bg-surface text-foreground hover:bg-hover border border-border focus-visible:outline-border",
      outline: "bg-transparent border border-border text-foreground hover:bg-hover focus-visible:outline-border",
      ghost: "bg-transparent text-foreground hover:bg-hover focus-visible:outline-hover",
      danger: "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // React 19 / Framer Motion type conflict mitigation:
    // Destructure conflicting standard HTML element animation/drag handlers
    const {
      onAnimationStart,
      onDragStart,
      onDragEnd,
      onDrag,
      onTransitionEnd,
      ...motionSafeProps
    } = props;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.01, y: disabled || loading ? 0 : -0.5 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={clsx(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...motionSafeProps}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// ---------------------------------------------------------------------------
// Component: IconButton
// ---------------------------------------------------------------------------

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, variant = "secondary", size = "md", ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
      secondary: "bg-surface text-foreground hover:bg-hover border border-border focus-visible:outline-border",
      outline: "bg-transparent border border-border text-foreground hover:bg-hover focus-visible:outline-border",
      ghost: "bg-transparent text-foreground hover:bg-hover focus-visible:outline-hover",
    };

    const sizeStyles = {
      sm: "h-8 w-8 p-1.5",
      md: "h-10 w-10 p-2.5",
      lg: "h-12 w-12 p-3.5",
    };

    const {
      onAnimationStart,
      onDragStart,
      onDragEnd,
      onDrag,
      onTransitionEnd,
      ...motionSafeProps
    } = props;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={clsx(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...motionSafeProps}
      >
        {children}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
