// ---------------------------------------------------------------------------
// Calculator: Achievements
// ---------------------------------------------------------------------------
// A rule-based, config-driven achievements engine.
// Evaluates achievements deterministically based on input metrics.
// ---------------------------------------------------------------------------

import type { AnalyticsEngineInput, AnalyticsAchievement } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";

interface AchievementRule {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  readonly evaluate: (input: AnalyticsEngineInput) => boolean;
}

const ACHIEVEMENT_RULES: readonly AchievementRule[] = [
  {
    id: "night-owl",
    title: "Night Owl",
    description: `Authored more than ${ANALYTICS_CONFIG.achievements.nightOwlCommitCount} commits late at night (${ANALYTICS_CONFIG.time.nightStartHour}:00 - 0${ANALYTICS_CONFIG.time.nightEndHour}:00).`,
    tier: "BRONZE",
    evaluate: (input) => {
      const nightOwlCount = input.commits.filter((c) => {
        const hour = new Date(c.authoredAt).getHours();
        return hour >= ANALYTICS_CONFIG.time.nightStartHour || hour < ANALYTICS_CONFIG.time.nightEndHour;
      }).length;
      return nightOwlCount >= ANALYTICS_CONFIG.achievements.nightOwlCommitCount;
    },
  },
  {
    id: "weekend-warrior",
    title: "Weekend Warrior",
    description: `Authored more than ${ANALYTICS_CONFIG.achievements.weekendWarriorCommitCount} commits during weekends (Saturday & Sunday).`,
    tier: "BRONZE",
    evaluate: (input) => {
      const weekendCount = input.commits.filter((c) => {
        const day = new Date(c.authoredAt).getDay();
        return ANALYTICS_CONFIG.time.weekendDays.includes(day);
      }).length;
      return weekendCount >= ANALYTICS_CONFIG.achievements.weekendWarriorCommitCount;
    },
  },
  {
    id: "marathon-coder",
    title: "Marathon Coder",
    description: `Maintained a coding streak of at least ${ANALYTICS_CONFIG.achievements.marathonCoderStreakDays} consecutive active days.`,
    tier: "GOLD",
    evaluate: (input) => {
      // Inline streak calculator to remain independent of other calculators
      const days = input.contributions.calendar.weeks.flatMap((w) => w.days);
      let longestStreak = 0;
      let tempStreak = 0;
      for (const d of days) {
        if (d.count > 0) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }
      return longestStreak >= ANALYTICS_CONFIG.achievements.marathonCoderStreakDays;
    },
  },
  {
    id: "open-source-explorer",
    title: "Open Source Explorer",
    description: `Contributed to repositories with a total of more than ${ANALYTICS_CONFIG.achievements.openSourceExplorerForkCount} forks.`,
    tier: "SILVER",
    evaluate: (input) => {
      const totalForks = input.repositories.reduce((sum, r) => sum + r.forkCount, 0);
      return totalForks >= ANALYTICS_CONFIG.achievements.openSourceExplorerForkCount;
    },
  },
  {
    id: "language-hopper",
    title: "Language Hopper",
    description: `Wrote code in at least ${ANALYTICS_CONFIG.achievements.languageHopperCount} different programming languages.`,
    tier: "SILVER",
    evaluate: (input) => {
      const languages = new Set<string>();
      for (const r of input.repositories) {
        for (const l of r.languageUsage) {
          languages.add(l.language.name);
        }
      }
      return languages.size >= ANALYTICS_CONFIG.achievements.languageHopperCount;
    },
  },
  {
    id: "consistency-champion",
    title: "Consistency Champion",
    description: `Contributed on more than ${ANALYTICS_CONFIG.achievements.consistencyChampionActiveDays} active days throughout the year.`,
    tier: "PLATINUM",
    evaluate: (input) => {
      const activeDays = input.contributions.calendar.weeks
        .flatMap((w) => w.days)
        .filter((d) => d.count > 0).length;
      return activeDays >= ANALYTICS_CONFIG.achievements.consistencyChampionActiveDays;
    },
  },
  {
    id: "repository-creator",
    title: "Repository Creator",
    description: `Created at least ${ANALYTICS_CONFIG.achievements.repositoryCreatorCount} public repositories.`,
    tier: "BRONZE",
    evaluate: (input) => {
      return input.repositories.length >= ANALYTICS_CONFIG.achievements.repositoryCreatorCount;
    },
  },
  {
    id: "pull-request-hero",
    title: "Pull Request Hero",
    description: `Opened and successfully merged at least ${ANALYTICS_CONFIG.achievements.pullRequestHeroCount} pull requests.`,
    tier: "GOLD",
    evaluate: (input) => {
      const mergedPrs = input.pullRequests.filter((pr) => pr.status === "MERGED").length;
      return mergedPrs >= ANALYTICS_CONFIG.achievements.pullRequestHeroCount;
    },
  },
  {
    id: "issue-hunter",
    title: "Issue Hunter",
    description: `Opened or participated in solving at least ${ANALYTICS_CONFIG.achievements.issueHunterCount} issues.`,
    tier: "BRONZE",
    evaluate: (input) => {
      return input.issues.length >= ANALYTICS_CONFIG.achievements.issueHunterCount;
    },
  },
  {
    id: "first-commit-anniversary",
    title: "Veteran Coder",
    description: "Account created more than 5 years ago.",
    tier: "SILVER",
    evaluate: (input) => {
      const ageMs = Date.now() - new Date(input.user.accountCreatedAt).getTime();
      const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
      return ageYears >= 5;
    },
  },
];

export function calculateAchievements(input: AnalyticsEngineInput): ReadonlyArray<AnalyticsAchievement> {
  const unlocked: AnalyticsAchievement[] = [];

  for (const rule of ACHIEVEMENT_RULES) {
    if (rule.evaluate(input)) {
      unlocked.push({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        tier: rule.tier,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return unlocked;
}
