// ---------------------------------------------------------------------------
// Calculator: Activity
// ---------------------------------------------------------------------------
// Aggregates commits, PRs, issues, and performs the time-of-day/day-of-week
// coding analysis.
// ---------------------------------------------------------------------------

import type { Commit, PullRequest, Issue, ContributionHistory } from "@/domain/models";
import type { AnalyticsActivity } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { createNormalizedScore } from "@/services/analytics/analytics.utils";

export function calculateActivity(
  commits: ReadonlyArray<Commit>,
  pullRequests: ReadonlyArray<PullRequest>,
  issues: ReadonlyArray<Issue>,
  contributions: ContributionHistory,
): AnalyticsActivity {
  // 1. Commits Analysis
  const totalCommitsCount = commits.length;
  let totalCommitLines = 0;
  let biggestCommitNode: Commit | null = null;
  let descriptiveMessageCount = 0;

  for (const c of commits) {
    const lines = c.linesAdded + c.linesDeleted;
    totalCommitLines += lines;

    if (!biggestCommitNode || lines > (biggestCommitNode.linesAdded + biggestCommitNode.linesDeleted)) {
      biggestCommitNode = c;
    }

    // Basic heuristic for descriptive commit messages:
    // Message headline should be longer than 10 characters and not be a standard generic string (like "update", "fix", etc.)
    const lowerMsg = c.summary.toLowerCase().trim();
    const isDescriptive =
      c.summary.length >= 10 &&
      !lowerMsg.startsWith("update") &&
      !lowerMsg.startsWith("fix") &&
      !lowerMsg.startsWith("wip");
    if (isDescriptive) {
      descriptiveMessageCount++;
    }
  }

  const averageLinesPerCommit = totalCommitsCount > 0 ? Math.round(totalCommitLines / totalCommitsCount) : 0;
  const commitMessageQualityScore = totalCommitsCount > 0 ? Math.round((descriptiveMessageCount / totalCommitsCount) * 100) : 100;

  // 2. Pull Requests Analysis
  let prOpened = 0, prMerged = 0, prClosed = 0;
  let biggestPrNode: PullRequest | null = null;

  for (const pr of pullRequests) {
    if (pr.status === "MERGED") prMerged++;
    else if (pr.status === "CLOSED") prClosed++;
    else prOpened++; // OPEN

    const lines = pr.linesAdded + pr.linesDeleted;
    if (!biggestPrNode || lines > (biggestPrNode.linesAdded + biggestPrNode.linesDeleted)) {
      biggestPrNode = pr;
    }
  }

  const prTotal = prOpened + prMerged + prClosed;
  const mergeRate = prTotal > 0 ? parseFloat((prMerged / prTotal).toFixed(3)) : 0;

  // 3. Issues Analysis
  let issueOpened = 0, issueClosed = 0;
  let mostReactedIssueNode: Issue | null = null;

  for (const issue of issues) {
    if (issue.status === "CLOSED") issueClosed++;
    else issueOpened++;

    if (!mostReactedIssueNode || issue.reactionCount > mostReactedIssueNode.reactionCount) {
      mostReactedIssueNode = issue;
    }
  }

  const issueTotal = issueOpened + issueClosed;
  const closeRate = issueTotal > 0 ? parseFloat((issueClosed / issueTotal).toFixed(3)) : 0;

  // 4. Time Analysis
  // Group commits and contributions by hour of day (UTC or local, assuming UTC from commit dates)
  const hourMap = new Array(24).fill(0);
  let weekendCount = 0;
  let weekdayCount = 0;
  let nightOwlCount = 0;
  let earlyBirdCount = 0;
  let totalTimedEvents = 0;

  // Parse commits to analyse coding times
  for (const c of commits) {
    const date = new Date(c.authoredAt);
    if (isNaN(date.getTime())) continue;

    const hour = date.getHours(); // 0-23
    const day = date.getDay(); // 0-6

    hourMap[hour]++;
    totalTimedEvents++;

    // Weekend vs Weekday
    const isWeekend = ANALYTICS_CONFIG.time.weekendDays.includes(day);
    if (isWeekend) weekendCount++;
    else weekdayCount++;

    // Night Owl vs Early Bird
    const isNight = hour >= ANALYTICS_CONFIG.time.nightStartHour || hour < ANALYTICS_CONFIG.time.nightEndHour;
    const isEarlyBird = hour >= ANALYTICS_CONFIG.time.earlyBirdStartHour && hour < ANALYTICS_CONFIG.time.earlyBirdEndHour;

    if (isNight) nightOwlCount++;
    if (isEarlyBird) earlyBirdCount++;
  }

  // Find most active hour
  let mostActiveHour = 0;
  let maxHourCommits = 0;
  for (let h = 0; h < 24; h++) {
    if (hourMap[h] > maxHourCommits) {
      maxHourCommits = hourMap[h];
      mostActiveHour = h;
    }
  }

  // Preferred session
  // Morning (5-12), Afternoon (12-17), Evening (17-22), Night (22-5)
  let morningCommits = 0, afternoonCommits = 0, eveningCommits = 0, nightCommits = 0;
  for (let h = 0; h < 24; h++) {
    const count = hourMap[h] ?? 0;
    if (h >= 5 && h < 12) morningCommits += count;
    else if (h >= 12 && h < 17) afternoonCommits += count;
    else if (h >= 17 && h < 22) eveningCommits += count;
    else nightCommits += count;
  }

  let preferredCodingSession: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" = "NIGHT";
  const maxSession = Math.max(morningCommits, afternoonCommits, eveningCommits, nightCommits);
  if (maxSession === morningCommits) preferredCodingSession = "MORNING";
  else if (maxSession === afternoonCommits) preferredCodingSession = "AFTERNOON";
  else if (maxSession === eveningCommits) preferredCodingSession = "EVENING";

  const nightOwlPercentage = totalTimedEvents > 0 ? (nightOwlCount / totalTimedEvents) * 100 : 0;
  const earlyBirdPercentage = totalTimedEvents > 0 ? (earlyBirdCount / totalTimedEvents) * 100 : 0;

  const nightOwlScore = createNormalizedScore(
    nightOwlPercentage,
    100,
    `Authored ${nightOwlPercentage.toFixed(1)}% of commits during late night hours (${ANALYTICS_CONFIG.time.nightStartHour}:00 - 0${ANALYTICS_CONFIG.time.nightEndHour}:00).`,
  );

  const earlyBirdScore = createNormalizedScore(
    earlyBirdPercentage,
    100,
    `Authored ${earlyBirdPercentage.toFixed(1)}% of commits during early morning hours (0${ANALYTICS_CONFIG.time.earlyBirdStartHour}:00 - 0${ANALYTICS_CONFIG.time.earlyBirdEndHour}:00).`,
  );

  return {
    commits: {
      totalCount: totalCommitsCount,
      averageLinesPerCommit,
      biggestCommit: biggestCommitNode
        ? {
            sha: biggestCommitNode.sha,
            summary: biggestCommitNode.summary,
            linesAdded: biggestCommitNode.linesAdded,
            linesDeleted: biggestCommitNode.linesDeleted,
            authoredAt: biggestCommitNode.authoredAt,
          }
        : null,
      commitMessageQualityScore,
    },
    pullRequests: {
      opened: prOpened + prMerged + prClosed,
      merged: prMerged,
      closed: prClosed,
      mergeRate,
      biggestPullRequest: biggestPrNode
        ? {
            id: biggestPrNode.id,
            title: biggestPrNode.title,
            totalLinesChanged: biggestPrNode.linesAdded + biggestPrNode.linesDeleted,
            url: biggestPrNode.url,
          }
        : null,
    },
    issues: {
      opened: issueOpened + issueClosed,
      closed: issueClosed,
      closeRate,
      mostReactedIssue: mostReactedIssueNode
        ? {
            id: mostReactedIssueNode.id,
            title: mostReactedIssueNode.title,
            reactions: mostReactedIssueNode.reactionCount,
            url: mostReactedIssueNode.url,
          }
        : null,
    },
    timeAnalysis: {
      mostActiveHour,
      nightOwlScore,
      earlyBirdScore,
      weekendActivity: totalTimedEvents > 0 ? parseFloat(((weekendCount / totalTimedEvents) * 100).toFixed(2)) : 0,
      weekdayActivity: totalTimedEvents > 0 ? parseFloat(((weekdayCount / totalTimedEvents) * 100).toFixed(2)) : 0,
      preferredCodingSession,
    },
  };
}
