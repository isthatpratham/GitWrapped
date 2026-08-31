"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Story, StorySlide } from "@/services/story";
import { Viewport, Stack, Flex, Grid } from "@/components/layout";
import {
  StoryFrame,
  StoryProgress,
  StoryHeader,
  StoryNavigation,
  StoryBackground,
  StoryFooter,
  Button,
  Heading,
  Caption,
} from "@/components/ui";
import { FadeUp, Scale } from "@/components/motion";
import { Github, RefreshCw, Share2 } from "@/components/icons";
import {
  buildChapterProgress,
  buildShareCardSvg,
  buildShareRequest,
  canNavigate,
  chapterChanged,
  nativeShareSupported,
  nextPlayerIndex,
  playerPhase,
  prevPlayerIndex,
  replayPlayerIndex,
  shareCardFileStem,
  shareCardStats,
  slideMotion,
  swipeNavDirection,
  keyboardNavAction,
  wheelNavDirection,
  NAV_LOCK_MS,
} from "@/lib/player";
import { SlideBody } from "./slide-graphics";

const SLIDE_DURATION = 6000;

function downloadTextFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function StoryPlayer({
  story,
  onClose,
}: {
  readonly story: Story;
  readonly onClose: () => void;
}) {
  const reduced = Boolean(useReducedMotion());
  const motionPreset = slideMotion(reduced);
  const slides = story.slides;
  const [activeIndex, setActiveIndex] = useState(replayPlayerIndex());
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [chapterCue, setChapterCue] = useState<string | null>(null);

  const lastNavAtRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);
  const progressRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const previousChapterRef = useRef<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const phase = playerPhase(activeIndex, slides.length);
  const currentSlide: StorySlide | undefined = phase === "slide" ? slides[activeIndex] : undefined;
  const chapterProgress = useMemo(
    () => buildChapterProgress(slides, phase === "slide" ? activeIndex : -1, progress),
    [slides, activeIndex, progress, phase],
  );

  const resetTimers = useCallback(() => {
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    progressRef.current = 0;
    setProgress(0);
  }, []);

  const navigateTo = useCallback(
    (nextIndex: number) => {
      const now = performance.now();
      if (!canNavigate(now, lastNavAtRef.current, reduced ? 150 : NAV_LOCK_MS)) return;
      lastNavAtRef.current = now;
      resetTimers();
      setActiveIndex(nextIndex);
    },
    [reduced, resetTimers],
  );

  const handleNext = useCallback(() => {
    navigateTo(nextPlayerIndex(activeIndex, slides.length));
  }, [activeIndex, navigateTo, slides.length]);

  const handlePrev = useCallback(() => {
    navigateTo(prevPlayerIndex(activeIndex, slides.length));
  }, [activeIndex, navigateTo, slides.length]);

  const handleReplay = useCallback(() => {
    lastNavAtRef.current = 0;
    setIsPaused(false);
    setShareNotice("");
    setChapterCue(null);
    previousChapterRef.current = null;
    resetTimers();
    setActiveIndex(replayPlayerIndex());
  }, [resetTimers]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (!prev) pausedTimeRef.current = progressRef.current;
      else startTimeRef.current = null;
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (phase !== "slide" || isPaused) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    const duration = currentSlide?.duration ?? SLIDE_DURATION;
    const tick = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - (pausedTimeRef.current * duration) / 100;
      }
      const currentProgress = Math.min(100, ((timestamp - startTimeRef.current) / duration) * 100);
      setProgress(currentProgress);
      progressRef.current = currentProgress;
      if (currentProgress < 100) {
        requestRef.current = requestAnimationFrame(tick);
      } else {
        handleNext();
      }
    };
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase, isPaused, currentSlide, handleNext]);

  useEffect(() => {
    if (phase !== "slide" || !currentSlide) return;
    const previous = previousChapterRef.current;
    if (chapterChanged(previous, currentSlide.chapter)) {
      setChapterCue(chapterProgress.currentTitle);
      const timeout = window.setTimeout(() => setChapterCue(null), reduced ? 150 : 700);
      previousChapterRef.current = currentSlide.chapter;
      return () => window.clearTimeout(timeout);
    }
    previousChapterRef.current = currentSlide.chapter;
    return;
  }, [phase, currentSlide, chapterProgress.currentTitle, reduced]);

  useEffect(() => {
    frameRef.current?.focus();
  }, []);

  const handlersRef = useRef({ handleNext, handlePrev, handleReplay, onClose, togglePause });
  useEffect(() => {
    handlersRef.current = { handleNext, handlePrev, handleReplay, onClose, togglePause };
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action = keyboardNavAction(event.code);
      if (!action) return;
      event.preventDefault();
      if (action === "next") handlersRef.current.handleNext();
      if (action === "prev") handlersRef.current.handlePrev();
      if (action === "close") handlersRef.current.onClose();
    };
    const onWheel = (event: WheelEvent) => {
      const direction = wheelNavDirection(event.deltaY);
      if (!direction) return;
      event.preventDefault();
      if (direction === "next") handlersRef.current.handleNext();
      else handlersRef.current.handlePrev();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;
    const direction = swipeNavDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction === "next") handleNext();
    if (direction === "prev") handlePrev();
  };

  const shareMoment = currentSlide?.shareable ? currentSlide : null;

  const handleShare = useCallback(
    async (moment?: StorySlide | null) => {
      const origin = window.location.origin;
      const request = buildShareRequest(story, origin, moment);
      try {
        if (nativeShareSupported(navigator.share) && navigator.share) {
          await navigator.share({ title: request.title, text: request.text, url: request.url });
          setShareNotice("Shared");
          return;
        }
        await navigator.clipboard.writeText(request.url);
        setShareNotice("Link copied");
      } catch {
        try {
          await navigator.clipboard.writeText(request.url);
          setShareNotice("Link copied");
        } catch {
          setShareNotice("Couldn't share just now");
        }
      }
      window.setTimeout(() => setShareNotice(""), 2000);
    },
    [story],
  );

  const downloadCard = useCallback(
    async (format: "svg" | "png", moment?: StorySlide | null) => {
      const stats = shareCardStats(story, moment);
      const svg = buildShareCardSvg(stats);
      const stem = shareCardFileStem(story.developer.handle, story.year);
      if (format === "svg") {
        downloadTextFile(`${stem}.svg`, svg, "image/svg+xml;charset=utf-8");
        return;
      }
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      try {
        const image = new window.Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("card"));
          image.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("card");
        ctx.fillStyle = "#05070B";
        ctx.fillRect(0, 0, 1080, 1920);
        ctx.drawImage(image, 0, 0, 1080, 1920);
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob((png) => {
            if (!png) {
              reject(new Error("card"));
              return;
            }
            const pngUrl = URL.createObjectURL(png);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${stem}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            resolve();
          }, "image/png");
        });
      } catch {
        setShareNotice("Couldn't download the card");
        window.setTimeout(() => setShareNotice(""), 2000);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [story],
  );

  const slideTheme = phase === "share" ? "summary" : currentSlide?.theme ?? "minimal";
  const liveLabel =
    phase === "splash"
      ? "Opening. Tap to begin your story."
      : phase === "share"
        ? "Finale. Share your story."
        : `${chapterProgress.chapterLabel}. ${currentSlide?.headline ?? ""}`;

  return (
    <Viewport className="bg-background flex items-center justify-center select-none overflow-hidden">
      <StoryFrame>
        <div
          ref={frameRef}
          tabIndex={0}
          className="absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <StoryBackground theme={slideTheme} />
          <div className="sr-only" aria-live="polite">
            {liveLabel}
          </div>

          <AnimatePresence mode="wait">
            {phase === "splash" ? (
              <motion.div
                key="splash"
                initial={motionPreset.initial}
                animate={motionPreset.animate}
                exit={motionPreset.exit}
                transition={{ duration: motionPreset.durationSec, ease: "easeOut" }}
                onClick={handleNext}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 cursor-pointer"
              >
                <Stack space={6} className="items-center">
                  <Flex className="gap-2">
                    <Github className="h-6 w-6 text-primary" />
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
            ) : phase === "share" ? (
              <motion.div
                key="share-screen"
                initial={motionPreset.initial}
                animate={motionPreset.animate}
                exit={motionPreset.exit}
                transition={{ duration: motionPreset.durationSec, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-between p-6 landscape:p-4"
              >
                <StoryHeader
                  avatarUrl={story.metadata.avatarUrl}
                  username={story.metadata.username}
                  subtitle="Share your story"
                  onClose={onClose}
                />
                <StoryNavigation onNext={() => undefined} onPrev={handlePrev} disableNext />
                <div className="flex-1 flex flex-col justify-center items-center overflow-auto">
                  <Stack space={5} className="w-full max-w-[320px]">
                    <Scale delay={reduced ? 0 : 0.15} className="relative bg-surface border border-border p-6 rounded-xl overflow-hidden">
                      <Stack space={4}>
                        <Flex justify="between" className="border-b border-border/10 pb-3">
                          <span className="font-display font-black text-xs tracking-widest text-primary uppercase">GitWrapped</span>
                          <span className="font-sans text-[10px] text-muted-foreground">{story.year}</span>
                        </Flex>
                        <Stack space={1} className="text-left">
                          <span className="font-display font-black text-xl text-foreground">@{story.developer.handle}</span>
                          <Caption className="text-[10px] text-muted-foreground leading-none">
                            Your year in code, beautifully wrapped.
                          </Caption>
                        </Stack>
                        <ShareCardPreview story={story} />
                      </Stack>
                    </Scale>
                    <FadeUp delay={reduced ? 0 : 0.25}>
                      <Stack space={2}>
                        <Button onClick={() => void handleShare()} variant="primary" className="w-full flex items-center justify-center gap-2">
                          <Share2 className="h-4 w-4" />
                          {shareNotice || "Share Your Story"}
                        </Button>
                        <Button onClick={() => void downloadCard("png")} variant="secondary" className="w-full">
                          Download card
                        </Button>
                        <Grid cols={2} gap={2}>
                          <Button onClick={handleReplay} variant="outline" size="sm" className="w-full flex items-center justify-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Run It Back
                          </Button>
                          <Button onClick={onClose} variant="outline" size="sm" className="w-full">
                            Return Home
                          </Button>
                        </Grid>
                      </Stack>
                    </FadeUp>
                  </Stack>
                </div>
                <Caption className="text-[9px] text-white/30 uppercase tracking-widest text-center">That&apos;s a wrap</Caption>
              </motion.div>
            ) : currentSlide ? (
              <motion.div
                key={currentSlide.id}
                initial={motionPreset.initial}
                animate={motionPreset.animate}
                exit={motionPreset.exit}
                transition={{ duration: motionPreset.durationSec, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-between"
              >
                <div>
                  <StoryProgress
                    groups={chapterProgress.groups}
                    label={chapterProgress.storyLabel}
                    onSegmentClick={(index) => navigateTo(index)}
                  />
                  <StoryHeader
                    avatarUrl={story.metadata.avatarUrl}
                    username={story.metadata.username}
                    subtitle={chapterProgress.currentTitle || `${story.year} Recap`}
                    isPaused={isPaused}
                    onPauseToggle={togglePause}
                    onClose={onClose}
                  />
                </div>
                <StoryNavigation
                  onNext={handleNext}
                  onPrev={handlePrev}
                  disablePrev={activeIndex <= -1}
                  disableNext={activeIndex >= slides.length}
                />
                <div className="flex-1 flex flex-col justify-center px-8 landscape:px-6 landscape:py-2 text-center relative z-base overflow-hidden">
                  <AnimatePresence>
                    {chapterCue ? (
                      <motion.p
                        key={chapterCue}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0.15 : 0.4 }}
                        className="absolute top-2 left-0 right-0 text-[10px] uppercase tracking-[0.28em] text-white/40"
                      >
                        {chapterCue}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                  <SlideBody slide={currentSlide} onReplay={handleReplay} />
                </div>
                <StoryFooter>
                  <Flex justify="between" className="w-full items-center gap-3">
                    <Caption className="text-[10px] text-white/45 uppercase tracking-[0.18em]">
                      {chapterProgress.currentTitle}
                    </Caption>
                    {currentSlide.shareable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleShare(shareMoment);
                        }}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        {shareNotice || "Share"}
                      </Button>
                    ) : null}
                  </Flex>
                </StoryFooter>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </StoryFrame>
    </Viewport>
  );
}

function ShareCardPreview({ story }: { readonly story: Story }) {
  const stats = shareCardStats(story);
  return (
    <Stack space={3} className="text-left py-1">
      <div>
        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Contributions</span>
        <span className="text-2xl font-display font-black text-foreground">{stats.contributions}</span>
      </div>
      <Grid cols={2} gap={2}>
        <div>
          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Language</span>
          <span className="text-xs font-sans font-bold text-foreground break-words leading-tight block">{stats.language ?? "—"}</span>
        </div>
        <div>
          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Longest streak</span>
          <span className="text-xs font-sans font-bold text-foreground">{stats.streakDays} days</span>
        </div>
      </Grid>
    </Stack>
  );
}
