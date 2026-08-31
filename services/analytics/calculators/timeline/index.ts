// ---------------------------------------------------------------------------
// Calculator: Timeline
// ---------------------------------------------------------------------------
// Groups contribution and activity metrics chronologically by day, week,
// month, quarter, and year.
// ---------------------------------------------------------------------------

import type { ContributionHistory, PullRequest, Issue } from "@/domain/models";
import { utcCalendarDate, utcQuarter, utcYearWeekString } from "@/lib/time/utc";
import type { AnalyticsTimeline, TimelineDataPoint } from "@/services/analytics/analytics.types";

export function calculateTimeline(
  contributions: ContributionHistory,
  pullRequests: ReadonlyArray<PullRequest>,
  issues: ReadonlyArray<Issue>,
): AnalyticsTimeline {
  const days = contributions.calendar.weeks.flatMap((w) => w.days);

  // 1. Daily timeline
  const dailyPoints: TimelineDataPoint[] = days.map((day) => {
    // Check if user opened PRs/issues on this day
    const dayStartStr = day.date;
    const prsCount = pullRequests.filter((pr) => {
      try {
        return utcCalendarDate(pr.openedAt) === dayStartStr;
      } catch {
        return false;
      }
    }).length;
    const issuesCount = issues.filter((is) => {
      try {
        return utcCalendarDate(is.openedAt) === dayStartStr;
      } catch {
        return false;
      }
    }).length;

    // Estimate commits for this day from calendar
    // In GitHub calendar, a contribution includes PRs, issues, commits, and reviews.
    // Let's compute commits as: totalCount - prsCount - issuesCount.
    // If it's negative, clamp to 0.
    const commitsCount = Math.max(0, day.count - prsCount - issuesCount);

    return {
      date: dayStartStr,
      commitCount: commitsCount,
      pullRequestCount: prsCount,
      issueCount: issuesCount,
      reviewCount: 0, // Review details are not directly accessible per-day in V1
      totalContributions: day.count,
    };
  });

  // 2. Weekly timeline
  const weeklyMap = new Map<string, TimelineDataPoint>();
  for (const dp of dailyPoints) {
    const weekKey = utcYearWeekString(dp.date);
    const existing = weeklyMap.get(weekKey);
    if (existing) {
      weeklyMap.set(weekKey, {
        date: weekKey,
        commitCount: existing.commitCount + dp.commitCount,
        pullRequestCount: existing.pullRequestCount + dp.pullRequestCount,
        issueCount: existing.issueCount + dp.issueCount,
        reviewCount: existing.reviewCount + dp.reviewCount,
        totalContributions: existing.totalContributions + dp.totalContributions,
      });
    } else {
      weeklyMap.set(weekKey, {
        date: weekKey,
        commitCount: dp.commitCount,
        pullRequestCount: dp.pullRequestCount,
        issueCount: dp.issueCount,
        reviewCount: dp.reviewCount,
        totalContributions: dp.totalContributions,
      });
    }
  }
  const weeklyPoints = Array.from(weeklyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 3. Monthly timeline
  const monthlyMap = new Map<string, TimelineDataPoint>();
  for (const dp of dailyPoints) {
    const yearMonth = dp.date.substring(0, 7); // YYYY-MM
    const existing = monthlyMap.get(yearMonth);
    if (existing) {
      monthlyMap.set(yearMonth, {
        date: yearMonth,
        commitCount: existing.commitCount + dp.commitCount,
        pullRequestCount: existing.pullRequestCount + dp.pullRequestCount,
        issueCount: existing.issueCount + dp.issueCount,
        reviewCount: existing.reviewCount + dp.reviewCount,
        totalContributions: existing.totalContributions + dp.totalContributions,
      });
    } else {
      monthlyMap.set(yearMonth, {
        date: yearMonth,
        commitCount: dp.commitCount,
        pullRequestCount: dp.pullRequestCount,
        issueCount: dp.issueCount,
        reviewCount: dp.reviewCount,
        totalContributions: dp.totalContributions,
      });
    }
  }
  const monthlyPoints = Array.from(monthlyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 4. Quarterly timeline
  const quarterlyMap = new Map<string, TimelineDataPoint>();
  for (const dp of dailyPoints) {
    const year = dp.date.substring(0, 4);
    const q = utcQuarter(dp.date);
    const quarterKey = `${year}-Q${q}`;
    const existing = quarterlyMap.get(quarterKey);
    if (existing) {
      quarterlyMap.set(quarterKey, {
        date: quarterKey,
        commitCount: existing.commitCount + dp.commitCount,
        pullRequestCount: existing.pullRequestCount + dp.pullRequestCount,
        issueCount: existing.issueCount + dp.issueCount,
        reviewCount: existing.reviewCount + dp.reviewCount,
        totalContributions: existing.totalContributions + dp.totalContributions,
      });
    } else {
      quarterlyMap.set(quarterKey, {
        date: quarterKey,
        commitCount: dp.commitCount,
        pullRequestCount: dp.pullRequestCount,
        issueCount: dp.issueCount,
        reviewCount: dp.reviewCount,
        totalContributions: dp.totalContributions,
      });
    }
  }
  const quarterlyPoints = Array.from(quarterlyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 5. Yearly timeline (summing up everything)
  const yearlyPoint = dailyPoints.reduce(
    (acc, dp) => ({
      date: dp.date.substring(0, 4),
      commitCount: acc.commitCount + dp.commitCount,
      pullRequestCount: acc.pullRequestCount + dp.pullRequestCount,
      issueCount: acc.issueCount + dp.issueCount,
      reviewCount: acc.reviewCount + dp.reviewCount,
      totalContributions: acc.totalContributions + dp.totalContributions,
    }),
    {
      date: days[0]?.date.substring(0, 4) ?? "",
      commitCount: 0,
      pullRequestCount: 0,
      issueCount: 0,
      reviewCount: 0,
      totalContributions: 0,
    },
  );

  return {
    daily: dailyPoints,
    weekly: weeklyPoints,
    monthly: monthlyPoints,
    quarterly: quarterlyPoints,
    yearly: yearlyPoint,
  };
}
