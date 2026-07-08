"use client";

// ---------------------------------------------------------------------------
// Page: Wrapped Player ([id])
// ---------------------------------------------------------------------------
// A full-screen, immersive cinematic slide player and sharing experience.
// Implements every slide defined in STORYBOARD.md, with segmented progress,
// side tap navigation, keyboard controls, and Framer Motion transitions.
// Includes the final custom Share Screen with high-quality SVG card export.
// ---------------------------------------------------------------------------

import React, { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getWrappedStoryDeck } from "@/app/actions/wrapped";
import type { StorySlide } from "@/services/story";
import { clsx } from "clsx";
import { Viewport, Container, Stack, Flex, Grid } from "@/components/layout";
import {
  StoryFrame,
  StoryProgress,
  StoryHeader,
  StoryNavigation,
  StoryBackground,
  StoryFooter,
  Button,
  Heading,
  Subtitle,
  MetricCard,
  Badge,
  Spinner,
  ErrorState,
  Caption,
  Code,
} from "@/components/ui";
import { Fade, FadeUp, Scale, BlurReveal, Counter } from "@/components/motion";
import { Github, Star, Award, Code as CodeIcon, BookOpen, Share2, RefreshCw } from "@/components/icons";
import type { Commit } from "@/domain/models";

// Duration of each slide in milliseconds (default: 6 seconds)
const SLIDE_DURATION = 6000;

export default function WrappedPlayerPage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Engine calculation state
  const [storyDeck, setStoryDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Slide player state
  const [activeIndex, setActiveIndex] = useState(-1); // -1 is Splash, slides.length is Share Screen
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Initialize and compute the story pipeline
  useEffect(() => {
    let active = true;

    async function loadRecap() {
      try {
        const decodedUsername = decodeURIComponent(id);
        setLoading(true);
        setError("");

        // Fetch fully generated story deck from the Next.js Server Action
        const deck = await getWrappedStoryDeck(decodedUsername);

        if (!active) return;

        setStoryDeck(deck);
        setLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error(err);
        
        // Map specific SDK errors to user-friendly messages
        const errMsg = err?.message || "";
        if (errMsg.includes("User not found") || errMsg.includes("404")) {
          setError("GitHub user not found. Please double-check the username.");
        } else if (errMsg.includes("rate limit") || errMsg.includes("403") || errMsg.includes("429")) {
          setError("GitHub API rate limit exceeded. Please try again later.");
        } else if (errMsg.includes("Authentication") || errMsg.includes("401") || errMsg.includes("GITHUB_TOKEN")) {
          setError("GitHub credentials error. Please verify your GITHUB_TOKEN environment variable.");
        } else {
          setError("Failed to load your GitWrapped story. Please verify your network connection.");
        }
        setLoading(false);
      }
    }

    loadRecap();

    return () => {
      active = false;
    };
  }, [id]);

  // ---------------------------------------------------------------------------
  // Progression & Timer Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (loading || error || activeIndex === -1 || activeIndex === (storyDeck?.slides.length ?? 0) || isPaused) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const duration = storyDeck?.slides[activeIndex]?.duration ?? SLIDE_DURATION;

    const animateProgress = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - (pausedTimeRef.current * duration) / 100;
      }

      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);

      setProgress(currentProgress);

      if (currentProgress < 100) {
        requestRef.current = requestAnimationFrame(animateProgress);
      } else {
        // Slide finished, advance next
        startTimeRef.current = null;
        pausedTimeRef.current = 0;
        setProgress(0);
        handleNext();
      }
    };

    requestRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [activeIndex, isPaused, loading, error, storyDeck]);

  // Handle Play/Pause toggling
  const togglePause = () => {
    setIsPaused((prev) => {
      if (!prev) {
        // Pausing: save current progress
        pausedTimeRef.current = progress;
      } else {
        // Resuming: clear start timer so it recalculates from current progress
        startTimeRef.current = null;
      }
      return !prev;
    });
  };

  // ---------------------------------------------------------------------------
  // Navigation functions
  // ---------------------------------------------------------------------------
  const handleNext = () => {
    if (!storyDeck) return;
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setProgress(0);

    if (activeIndex === -1) {
      // Enter first slide
      setActiveIndex(0);
    } else if (activeIndex < storyDeck.slides.length) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!storyDeck) return;
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setProgress(0);

    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (activeIndex === 0) {
      setActiveIndex(-1); // Back to splash
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePause();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, storyDeck, progress]);

  // ---------------------------------------------------------------------------
  // SVG Card Downloader
  // ---------------------------------------------------------------------------
  const downloadCardAsSVG = () => {
    if (!storyDeck) return;

    const username = storyDeck.metadata.username;
    const year = storyDeck.metadata.year;

    // Find stats from the Summary slide metadata
    const summarySlide = storyDeck.slides.find((s: any) => s.type === "Summary");
    const stats = summarySlide?.metadata?.shareStatistics || {};
    const topMetrics = summarySlide?.metadata?.topMetrics || [];

    const commitsCount = topMetrics.find((m: any) => m.name === "Commits")?.value || "0";

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#02040a" />
      <stop offset="50%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#02040a" />
    </linearGradient>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&amp;display=swap');
      .font-sans { font-family: 'Montserrat', sans-serif; }
      .text-primary { fill: #8b5cf6; }
      .text-secondary { fill: #06b6d4; }
      .text-muted { fill: #8b949e; }
      .text-light { fill: #f9fafb; }
      .bold { font-weight: 700; }
      .black { font-weight: 900; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="800" height="1200" fill="url(#bg)" />

  <!-- Glowing accent borders -->
  <rect x="20" y="20" width="760" height="1160" rx="16" fill="none" stroke="#21262d" stroke-width="2" />
  <rect x="20" y="20" width="760" height="1160" rx="16" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-opacity="0.1" />

  <!-- Header -->
  <text x="60" y="100" class="font-sans black text-primary" font-size="16" letter-spacing="4">GITWRAPPED</text>
  <text x="740" y="100" text-anchor="end" class="font-sans bold text-muted" font-size="16">${year}</text>

  <!-- Developer Card Section -->
  <text x="60" y="220" class="font-sans black text-light" font-size="48">@${username}</text>
  <text x="60" y="260" class="font-sans text-muted" font-size="16">Your Year in Code, Beautifully Wrapped</text>

  <!-- Highlight stats -->
  <g transform="translate(60, 360)">
    <text x="0" y="0" class="font-sans bold text-muted" font-size="14" letter-spacing="2">CONTRIBUTIONS</text>
    <text x="0" y="70" class="font-sans black text-primary" font-size="80">${stats.formattedTotalContributions || "0"}</text>
  </g>

  <!-- Metric grid list -->
  <g transform="translate(60, 580)">
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="font-sans bold text-muted" font-size="12" letter-spacing="2">TOP LANGUAGE</text>
      <text x="0" y="32" class="font-sans black text-light" font-size="28">${stats.topLanguageName || "Code"}</text>
    </g>
    
    <g transform="translate(360, 0)">
      <text x="0" y="0" class="font-sans bold text-muted" font-size="12" letter-spacing="2">LONGEST STREAK</text>
      <text x="0" y="32" class="font-sans black text-light" font-size="28">${stats.longestStreakDays || "0"} Days</text>
    </g>

    <g transform="translate(0, 140)">
      <text x="0" y="0" class="font-sans bold text-muted" font-size="12" letter-spacing="2">RANK PERCENTILE</text>
      <text x="0" y="32" class="font-sans black text-light" font-size="28">Top ${stats.globalRankPercentage || "1"}%</text>
    </g>

    <g transform="translate(360, 140)">
      <text x="0" y="0" class="font-sans bold text-muted" font-size="12" letter-spacing="2">COMMITS</text>
      <text x="0" y="32" class="font-sans black text-light" font-size="28">${commitsCount}</text>
    </g>
  </g>

  <!-- Dotted border divider -->
  <line x1="60" y1="880" x2="740" y2="880" stroke="#30363d" stroke-width="2" stroke-dasharray="8 8" />

  <!-- Footnote Brand Branding -->
  <g transform="translate(60, 960)">
    <text x="0" y="0" class="font-sans bold text-muted" font-size="14" letter-spacing="2">MADE BY GITWRAPPED.DEV</text>
    <text x="0" y="35" class="font-sans text-muted" font-size="14">Every project. Every late night. Every milestone. Redeemed.</text>
  </g>
</svg>
`;

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${username}-gitwrapped-2026.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // Share triggers
  // ---------------------------------------------------------------------------
  const handleShareStory = () => {
    if (!storyDeck) return;
    const shareData = {
      title: "GitWrapped 2026",
      text: storyDeck.sharing.defaultShareText,
      url: storyDeck.sharing.shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(storyDeck.sharing.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Layout rendering states
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Viewport className="flex items-center justify-center bg-black">
        <Spinner />
      </Viewport>
    );
  }

  if (error) {
    return (
      <Viewport className="flex items-center justify-center bg-black p-4">
        <ErrorState description={error} onRetry={() => router.push("/")} />
      </Viewport>
    );
  }

  const slides = storyDeck?.slides ?? [];
  const onShareScreen = activeIndex === slides.length;
  const currentSlide = slides[activeIndex];
  const slideTheme = onShareScreen ? "summary" : currentSlide?.theme ?? "minimal";

  // Summary statistics for the final Share Screen layout
  const summarySlide = slides.find((s: any) => s.type === "Summary");
  const shareStats = summarySlide?.metadata?.shareStatistics || {};

  return (
    <Viewport className="bg-black flex items-center justify-center select-none overflow-hidden">
      <StoryFrame>
        {/* Dynamic sliding background texture */}
        <StoryBackground theme={slideTheme} />

        <AnimatePresence mode="wait">
          {activeIndex === -1 ? (
            // SPLASH SCREEN (Slide 00)
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              onClick={handleNext}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 cursor-pointer"
            >
              <Stack space={6} className="items-center">
                <Flex className="gap-2">
                  <Github className="h-6 w-6 text-primary animate-pulse" />
                  <span className="font-display text-lg tracking-[0.4em] uppercase font-bold text-foreground">
                    GitWrapped
                  </span>
                </Flex>
                <div className="h-[1px] w-12 bg-white/20" />
                <Heading as="h1" className="text-xl font-medium text-muted-foreground/80 font-sans tracking-wide">
                  Your year in code.
                  <br />
                  Beautifully wrapped.
                </Heading>
                <Caption className="text-[10px] text-white/30 uppercase tracking-[0.2em] pt-4">
                  Tap to begin your story
                </Caption>
              </Stack>
            </motion.div>
          ) : onShareScreen ? (
            // FINAL SHARING EXPERIENCE SCREEN
            <motion.div
              key="share-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col justify-between p-6"
            >
              {/* Story Header */}
              <StoryHeader
                avatarUrl={storyDeck.metadata.avatarUrl}
                username={storyDeck.metadata.username}
                subtitle="Share Card"
                onClose={() => router.push("/")}
              />

              {/* Side Tap Navigation Overlay (allows going back to Closing slide) */}
              <StoryNavigation onNext={() => {}} onPrev={handlePrev} />

              {/* Share Canvas Layout */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <Stack space={6} className="w-full max-w-[320px]">
                  {/* Summary Card Container */}
                  <Scale delay={0.2} className="relative bg-surface border border-border p-6 rounded-xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none rounded-xl" />
                    
                    <Stack space={4}>
                      <Flex justify="between" className="border-b border-border/10 pb-3">
                        <span className="font-display font-black text-xs tracking-widest text-primary uppercase">GITWRAPPED</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{storyDeck.metadata.year}</span>
                      </Flex>

                      <Stack space={1} className="text-left">
                        <span className="font-display font-black text-xl text-foreground">@{storyDeck.metadata.username}</span>
                        <Caption className="text-[10px] text-muted-foreground leading-none">Your year in code, beautifully wrapped.</Caption>
                      </Stack>

                      <Stack space={3} className="text-left py-2">
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Contributions</span>
                          <span className="text-2xl font-display font-black text-foreground">{shareStats.formattedTotalContributions}</span>
                        </div>
                        <Grid cols={2} gap={2}>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Favorite Tech</span>
                            <span className="text-xs font-sans font-bold text-foreground break-words whitespace-normal leading-tight block">{shareStats.topLanguageName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Longest Streak</span>
                            <span className="text-xs font-sans font-bold text-foreground">{shareStats.longestStreakDays} Days</span>
                          </div>
                        </Grid>
                      </Stack>

                      <div className="border-t border-dashed border-border/20 pt-3">
                        <Caption className="text-[9px] text-muted-foreground/60 block text-center">
                          MADE BY GITWRAPPED.DEV
                        </Caption>
                      </div>
                    </Stack>
                  </Scale>

                  {/* Actions Grid */}
                  <FadeUp delay={0.4}>
                    <Stack space={2}>
                      <Button onClick={handleShareStory} variant="primary" className="w-full flex items-center justify-center gap-2 py-3">
                        <Share2 className="h-4 w-4" />
                        {copied ? "Copied Link!" : "Share Your Story"}
                      </Button>
                      
                      <Button onClick={downloadCardAsSVG} variant="secondary" className="w-full py-3">
                        Download Card (SVG)
                      </Button>

                      <Grid cols={2} gap={2}>
                        <Button
                          onClick={() => {
                            setActiveIndex(0);
                            setProgress(0);
                            setIsPaused(false);
                            startTimeRef.current = null;
                            pausedTimeRef.current = 0;
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full py-2.5 flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Run It Back
                        </Button>
                        <Button onClick={() => router.push("/")} variant="outline" size="sm" className="w-full py-2.5">
                          Return Home
                        </Button>
                      </Grid>
                    </Stack>
                  </FadeUp>
                </Stack>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <Caption className="text-[9px] text-white/30 uppercase tracking-widest">
                  That's A Wrap
                </Caption>
              </div>
            </motion.div>
          ) : (
            // STORY SLIDE CONTENT
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col justify-between"
            >
              {/* Segmented Top Progress Indicators */}
              <StoryProgress
                count={slides.length}
                activeIndex={activeIndex}
                progress={progress}
                onSegmentClick={(idx) => {
                  setActiveIndex(idx);
                  setProgress(0);
                  startTimeRef.current = null;
                  pausedTimeRef.current = 0;
                }}
              />

              {/* Story Header */}
              <StoryHeader
                avatarUrl={storyDeck.metadata.avatarUrl}
                username={storyDeck.metadata.username}
                subtitle={`${storyDeck.metadata.year} Recap`}
                isPaused={isPaused}
                onPauseToggle={togglePause}
                onClose={() => router.push("/")}
              />

              {/* Side Tap Navigation Overlay */}
              <StoryNavigation onNext={handleNext} onPrev={handlePrev} />

              {/* Visualized Slide Body */}
              <div className="flex-1 flex flex-col justify-center px-8 text-center relative z-base">
                <Stack space={6} className="items-center">
                  <FadeUp delay={0.2}>
                    <Badge variant="accent">{currentSlide.subtitle ?? currentSlide.type}</Badge>
                  </FadeUp>

                  <BlurReveal delay={0.4}>
                    <Heading className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                      {currentSlide.headline}
                    </Heading>
                  </BlurReveal>

                  <div className="w-full flex justify-center py-4">
                    {renderSlideGraphic(currentSlide)}
                  </div>

                  <Fade delay={0.8}>
                    <Subtitle className="text-sm text-muted-foreground/90 leading-relaxed font-normal">
                      {currentSlide.description}
                    </Subtitle>
                  </Fade>
                </Stack>
              </div>

              {/* Story Footer */}
              <StoryFooter>
                <Flex justify="between" className="w-full">
                  <Caption className="text-[10px] text-white/40 font-mono">
                    SLIDE {activeIndex + 1} OF {slides.length}
                  </Caption>
                  {currentSlide.shareable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareStory();
                      }}
                      className="text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {copied ? "Copied!" : "Share Link"}
                    </Button>
                  )}
                </Flex>
              </StoryFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </StoryFrame>
    </Viewport>
  );
}

// ---------------------------------------------------------------------------
// Render graphics for each slide dynamically based on slide type
// ---------------------------------------------------------------------------
function renderSlideGraphic(slide: StorySlide) {
  const metadata = slide.metadata;

  switch (slide.type) {
    case "Welcome":
      return (
        <Scale delay={0.4}>
          <div className="relative rounded-full p-1.5 border border-primary/20 bg-primary/5">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <Github className="h-16 w-16 text-primary relative" />
          </div>
        </Scale>
      );

    case "Overview":
      return (
        <Grid cols={2} gap={2} className="w-full">
          <MetricCard label="Contributions" value={Number(metadata.totalContributions)} delay={0.5} />
          <MetricCard label="Commits" value={Number(metadata.totalCommits)} delay={0.7} />
        </Grid>
      );

    case "Contributions":
      return (
        <Scale delay={0.4}>
          <div className="flex gap-1.5 items-end justify-center h-20 px-4">
            {[5, 12, 8, 15, 2, 7, 10, 14, 4, 9, 11, 6, 8, 13, 3].map((val, idx) => (
              <div
                key={idx}
                className={clsx(
                  "w-2 rounded-t-sm transition-all duration-500",
                  val >= 12 ? "bg-primary" : val >= 8 ? "bg-secondary" : "bg-muted-foreground/30"
                )}
                style={{ height: `${(val / 15) * 100}%` }}
              />
            ))}
          </div>
        </Scale>
      );

    case "Consistency":
      return (
        <Stack space={2} className="items-center">
          <div className="text-4xl md:text-5xl font-display font-black text-primary">
            <Counter value={Number(metadata.longestStreak)} delay={0.5} /> DAYS
          </div>
          <Badge variant="success">Unstoppable Streak</Badge>
        </Stack>
      );

    case "Productivity":
      return (
        <div className="h-20 flex items-center justify-center">
          <Code className="text-sm uppercase tracking-widest text-secondary border border-secondary/20 bg-secondary/5 px-4 py-2">
            Favorite: {metadata.preferredSession as string} Window
          </Code>
        </div>
      );

    case "Languages":
      const breakdown = (metadata.breakdown as any[]) || [];
      return (
        <Stack space={3} className="w-full max-w-[280px]">
          {breakdown.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 w-full text-left">
              <Flex justify="between" className="w-full text-xs font-semibold">
                <span className="text-foreground/80 break-words whitespace-normal leading-tight min-w-0 pr-2">{item.name}</span>
                <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">{item.percentage}%</span>
              </Flex>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 * idx }}
                  className="h-full bg-primary"
                  style={{ backgroundColor: item.color || "#8b5cf6" }}
                />
              </div>
            </div>
          ))}
        </Stack>
      );

    case "Repositories":
      const favRepo: any = metadata.favoriteRepository;
      return (
        <Stack space={2} className="items-center">
          <div className="p-4 bg-surface border border-border rounded-md w-full max-w-[280px] text-left hover:border-primary/20 transition-all">
            <Flex justify="between" className="mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <Flex className="gap-1 text-xs font-semibold text-muted-foreground">
                <Star className="h-3 w-3 text-warning" />
                {favRepo?.starCount ?? 0}
              </Flex>
            </Flex>
            <span className="font-display font-bold text-sm block break-words whitespace-normal leading-tight text-foreground">{favRepo?.name}</span>
            <span className="font-sans text-[11px] text-muted-foreground block break-words whitespace-normal leading-tight">pushed to main branch</span>
          </div>
        </Stack>
      );

    case "Organizations":
      const orgList = (metadata.organizationList as any[]) || [];
      return (
        <Flex justify="center" className="gap-2.5">
          {orgList.slice(0, 3).map((org, idx) => (
            <div key={idx} className="p-3 bg-surface border border-border rounded-lg flex flex-col items-center gap-1 w-[80px]">
              <span className="font-display font-bold text-xs text-center break-words whitespace-normal leading-tight text-foreground">{org.handle}</span>
              <span className="font-sans text-[9px] text-muted-foreground text-center break-words whitespace-normal">{org.repositoryCount} repos</span>
            </div>
          ))}
        </Flex>
      );

    case "Achievements":
      const badges = (metadata.achievementsList as any[]) || [];
      return (
        <Flex justify="center" className="gap-2 flex-wrap max-w-[280px]">
          {badges.slice(0, 4).map((badge, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 bg-surface border border-border rounded-md flex items-center gap-1.5 hover:border-primary/20 transition-colors"
            >
              <Award className="h-3.5 w-3.5 text-primary" />
              <span className="font-sans text-xs font-semibold text-foreground/80">{badge.title}</span>
            </div>
          ))}
        </Flex>
      );

    case "Timeline":
      return (
        <Scale delay={0.4}>
          <div className="flex gap-2 items-center">
            <Code className="text-[11px] font-mono border border-border bg-surface px-3 py-1 text-muted-foreground">
              Q1
            </Code>
            <div className="h-[2px] w-8 bg-border" />
            <Code className="text-[11px] font-mono border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              Q4 Peak
            </Code>
          </div>
        </Scale>
      );

    case "Highlights":
      const facts = (metadata.highlights as string[]) || [];
      return (
        <Stack space={2} className="w-full max-w-[280px] text-left">
          {facts.slice(0, 2).map((fact, idx) => (
            <div key={idx} className="p-3 bg-surface/50 border border-border/50 rounded-md">
              <span className="font-sans text-xs leading-normal font-medium text-foreground/80">{fact}</span>
            </div>
          ))}
        </Stack>
      );

    case "Summary":
      const summaryStats: any = metadata.shareStatistics;
      return (
        <Stack space={4} className="w-full max-w-[300px] bg-surface border border-border p-6 rounded-xl relative">
          <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none rounded-xl" />
          <Flex justify="between" className="border-b border-border/20 pb-3">
            <span className="font-display font-black text-sm tracking-widest text-primary uppercase">GITWRAPPED</span>
            <span className="font-mono text-xs text-muted-foreground">2026</span>
          </Flex>
          
          <Stack space={2} className="text-left">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Contributions</span>
              <span className="text-2xl font-display font-black text-foreground">{summaryStats?.formattedTotalContributions}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Favorite Tech</span>
              <span className="text-sm font-sans font-bold text-foreground">{summaryStats?.topLanguageName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Longest Streak</span>
              <span className="text-sm font-sans font-bold text-foreground">{summaryStats?.longestStreakDays} Days</span>
            </div>
          </Stack>
        </Stack>
      );

    case "Closing":
      return (
        <Flex justify="center" className="gap-3 pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              window.location.reload();
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Run It Back
          </Button>
        </Flex>
      );

    default:
      return null;
  }
}
