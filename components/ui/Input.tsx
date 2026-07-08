"use client";

import React from "react";
import { clsx } from "clsx";
import { Search } from "@/components/icons";

// ---------------------------------------------------------------------------
// Component: Input
// ---------------------------------------------------------------------------
// Reusable text input primitive with custom border glows and focus state.
// ---------------------------------------------------------------------------

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <input
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 bg-surface border border-border rounded-md text-foreground placeholder:text-muted-foreground font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-medium text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

// ---------------------------------------------------------------------------
// Component: SearchInput
// ---------------------------------------------------------------------------

export interface SearchInputProps extends InputProps {
  readonly onSearch?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, error, onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(e.currentTarget.value);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={ref}
            type="text"
            onKeyDown={handleKeyDown}
            className={clsx(
              "w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-md text-foreground placeholder:text-muted-foreground font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-danger focus:border-danger focus:ring-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs font-medium text-danger">{error}</span>}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
