"use client";

// ---------------------------------------------------------------------------
// Component: ThemeProvider
// ---------------------------------------------------------------------------
// Manages GitWrapped story-level theme state (minimal, focus, celebration, etc.)
// and applies theme class names to the document or containing element.
// ---------------------------------------------------------------------------

import React, { createContext, useContext, useState, useEffect } from "react";
import type { StoryTheme } from "@/services/story/story.types";

interface ThemeContextType {
  readonly theme: StoryTheme;
  readonly setTheme: (theme: StoryTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultTheme?: StoryTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "minimal",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<StoryTheme>(defaultTheme);

  useEffect(() => {
    // Apply theme data attribute to the HTML tag to allow style targeting
    const root = window.document.documentElement;
    root.setAttribute("data-story-theme", theme);
  }, [theme]);

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme} w-full h-full min-h-screen bg-background text-foreground`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useStoryTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useStoryTheme must be used within a ThemeProvider");
  }
  return context;
}
