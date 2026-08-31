"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { StorySlide } from "@/services/story";
import { Stack, Flex, Grid } from "@/components/layout";
import { Badge, Button, Caption, Code, MetricCard } from "@/components/ui";
import { Fade, FadeUp, Scale, BlurReveal, Counter } from "@/components/motion";
import { Award, BookOpen, Github, RefreshCw, Star } from "@/components/icons";
import { getNumericSizeClass, getRepoNameSizeClass } from "@/lib/numeric-scale";
import { isUnavailableMoment } from "@/lib/player";

function languageBreakdownRows(
  value: unknown,
): ReadonlyArray<{ name: string; percentage: number; color: string | null }> {
  if (!Array.isArray(value)) return [];
  const rows: Array<{ name: string; percentage: number; color: string | null }> = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    if (!("name" in item) || !("percentage" in item)) continue;
    const name = item.name;
    const percentage = item.percentage;
    if (typeof name !== "string" || typeof percentage !== "number") continue;
    const color =
      "color" in item && (typeof item.color === "string" || item.color === null) ? item.color : null;
    rows.push({ name, percentage, color });
  }
  return rows;
}

function repositoryPreview(value: unknown): {
  readonly name: string;
  readonly ownerName: string;
  readonly starCount: number;
} | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") return null;
  return {
    name: record.name,
    ownerName: typeof record.ownerName === "string" ? record.ownerName : "",
    starCount: typeof record.starCount === "number" ? record.starCount : 0,
  };
}

function organizationRows(value: unknown): ReadonlyArray<{ handle: string; repositoryCount: number }> {
  if (!Array.isArray(value)) return [];
  const rows: Array<{ handle: string; repositoryCount: number }> = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || !("handle" in item)) continue;
    const handle = item.handle;
    if (typeof handle !== "string") continue;
    rows.push({
      handle,
      repositoryCount:
        "repositoryCount" in item && typeof item.repositoryCount === "number" ? item.repositoryCount : 0,
    });
  }
  return rows;
}

function achievementRows(value: unknown): ReadonlyArray<{ title: string }> {
  if (!Array.isArray(value)) return [];
  const rows: Array<{ title: string }> = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || !("title" in item) || typeof item.title !== "string") continue;
    rows.push({ title: item.title });
  }
  return rows;
}

export function SlideGraphic({
  slide,
  onReplay,
}: {
  readonly slide: StorySlide;
  readonly onReplay?: () => void;
}) {
  if (isUnavailableMoment(slide)) {
    return (
      <Caption className="text-sm text-muted-foreground max-w-[240px]">
        This moment did not have enough public data to tell.
      </Caption>
    );
  }

  const metadata = slide.metadata;

  switch (slide.type) {
    case "Welcome":
      return (
        <Scale delay={0.35}>
          <div className="relative rounded-full p-1.5 border border-primary/20 bg-primary/5">
            <Github className="h-16 w-16 text-primary relative" />
          </div>
        </Scale>
      );
    case "Overview":
      return (
        <Grid cols={2} gap={2} className="w-full">
          <MetricCard label="Contributions" value={Number(metadata.totalContributions)} delay={0.45} />
          <MetricCard label="Commits" value={Number(metadata.totalCommits)} delay={0.65} />
        </Grid>
      );
    case "Contributions":
      return (
        <Scale delay={0.35}>
          <div className="flex gap-1.5 items-end justify-center h-20 px-4" aria-hidden="true">
            {[5, 12, 8, 15, 2, 7, 10, 14, 4, 9, 11, 6, 8, 13, 3].map((val, idx) => (
              <div
                key={idx}
                className={clsx(
                  "w-2 rounded-t-sm",
                  val >= 12 ? "bg-primary" : val >= 8 ? "bg-secondary" : "bg-muted-foreground/30",
                )}
                style={{ height: `${(val / 15) * 100}%` }}
              />
            ))}
          </div>
        </Scale>
      );
    case "Consistency": {
      const streakValue = Number(metadata.longestStreak);
      return (
        <Stack space={2} className="items-center">
          <div className="flex items-baseline gap-2">
            <span className={clsx("font-display font-black text-primary tabular-nums leading-none", getNumericSizeClass(streakValue))}>
              <Counter value={streakValue} delay={0.45} />
            </span>
            <span className="font-display text-xl font-bold text-primary/70 uppercase tracking-widest">Days</span>
          </div>
        </Stack>
      );
    }
    case "Productivity":
      return (
        <div className="h-20 flex items-center justify-center">
          <Code className="text-sm uppercase tracking-widest text-secondary border border-secondary/20 bg-secondary/5 px-4 py-2">
            {String(metadata.preferredSession ?? "UTC")} window
          </Code>
        </div>
      );
    case "Languages": {
      const breakdown = languageBreakdownRows(metadata.breakdown);
      return (
        <Stack space={3} className="w-full max-w-[280px]">
          {breakdown.slice(0, 3).map((item, idx) => (
            <div key={item.name} className="flex flex-col gap-1 w-full text-left">
              <Flex justify="between" className="w-full text-xs font-semibold">
                <span className="text-foreground/80 break-words whitespace-normal leading-tight min-w-0 pr-2">{item.name}</span>
                <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">{item.percentage}%</span>
              </Flex>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 * idx, ease: "easeOut" }}
                  className="h-full bg-primary"
                  style={{ backgroundColor: item.color ?? "#8b5cf6" }}
                />
              </div>
            </div>
          ))}
        </Stack>
      );
    }
    case "Repositories": {
      const favRepo = repositoryPreview(metadata.favoriteRepository);
      const repoOwner = favRepo?.ownerName ?? "";
      const repoName = favRepo?.name ?? "Unknown repository";
      const fullPath = repoOwner ? `${repoOwner}/${repoName}` : repoName;
      return (
        <Stack space={2} className="items-center">
          <div className="p-4 bg-surface border border-border rounded-md w-full max-w-[280px] text-left overflow-hidden">
            <Flex justify="between" className="mb-3 min-w-0">
              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <Flex className="gap-1 text-xs font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                <Star className="h-3 w-3 text-warning" />
                {(favRepo?.starCount ?? 0).toLocaleString()}
              </Flex>
            </Flex>
            {repoOwner ? (
              <span className="font-mono text-[10px] text-muted-foreground/70 block leading-none mb-0.5 [overflow-wrap:anywhere]">
                {repoOwner}/
              </span>
            ) : null}
            <span
              className={clsx(
                "font-display font-bold block [overflow-wrap:anywhere] leading-tight text-foreground",
                getRepoNameSizeClass(fullPath),
              )}
            >
              {repoName}
            </span>
          </div>
        </Stack>
      );
    }
    case "Organizations": {
      const orgList = organizationRows(metadata.organizationList);
      return (
        <Flex justify="center" className="gap-2.5">
          {orgList.slice(0, 3).map((org) => (
            <div key={org.handle} className="p-3 bg-surface border border-border rounded-lg flex flex-col items-center gap-1 w-[80px]">
              <span className="font-display font-bold text-xs text-center break-words leading-tight text-foreground">{org.handle}</span>
              <span className="font-sans text-[9px] text-muted-foreground text-center">{org.repositoryCount} repos</span>
            </div>
          ))}
        </Flex>
      );
    }
    case "Achievements": {
      const badges = achievementRows(metadata.achievementsList);
      return (
        <Flex justify="center" className="gap-2 flex-wrap max-w-[280px]">
          {badges.slice(0, 4).map((badge) => (
            <div key={badge.title} className="px-3 py-1.5 bg-surface border border-border rounded-md flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span className="font-sans text-xs font-semibold text-foreground/80">{badge.title}</span>
            </div>
          ))}
        </Flex>
      );
    }
    case "Timeline":
      return (
        <Scale delay={0.35}>
          <div className="flex gap-2 items-center">
            <Code className="text-[11px] font-mono border border-border bg-surface px-3 py-1 text-muted-foreground">Q1</Code>
            <div className="h-[2px] w-8 bg-border" />
            <Code className="text-[11px] font-mono border border-primary/20 bg-primary/5 px-3 py-1 text-primary">Later peak</Code>
          </div>
        </Scale>
      );
    case "Highlights": {
      const facts = Array.isArray(metadata.highlights)
        ? metadata.highlights.filter((item): item is string => typeof item === "string")
        : [];
      return (
        <Stack space={2} className="w-full max-w-[280px] text-left">
          {facts.slice(0, 2).map((fact) => (
            <div key={fact} className="p-3 bg-surface/50 border border-border/50 rounded-md">
              <span className="font-sans text-xs leading-normal font-medium text-foreground/80">{fact}</span>
            </div>
          ))}
        </Stack>
      );
    }
    case "Closing":
      return (
        <Flex justify="center" className="gap-3 pt-2">
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onReplay?.();
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

export function SlideBody({
  slide,
  onReplay,
}: {
  readonly slide: StorySlide;
  readonly onReplay?: () => void;
}) {
  return (
    <Stack space={6} className="items-center">
      <FadeUp delay={0.08}>
        <Badge variant="accent">{slide.subtitle ?? slide.title}</Badge>
      </FadeUp>
      <BlurReveal delay={0.16}>
        <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-tight leading-snug break-words [overflow-wrap:anywhere] hyphens-auto max-w-full text-foreground">
          {slide.headline}
        </h2>
      </BlurReveal>
      <div className="w-full flex justify-center py-3">
        <SlideGraphic slide={slide} onReplay={onReplay} />
      </div>
      <Fade delay={0.42}>
        <p className="text-sm text-muted-foreground/90 leading-relaxed font-normal max-w-prose">
          {slide.description}
        </p>
      </Fade>
    </Stack>
  );
}
