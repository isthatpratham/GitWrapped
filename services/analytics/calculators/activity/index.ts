import type { Commit, PullRequest, Issue } from "@/domain/models";
import { utcHour, utcWeekday } from "@/lib/time/utc";
import type { AnalyticsActivity } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { createNormalizedScore } from "@/services/analytics/analytics.utils";

function isDescriptiveCommitSummary(summary: string): boolean {
  const lowerMsg = summary.toLowerCase().trim();
  return (
    summary.length >= 10 &&
    !lowerMsg.startsWith("update") &&
    !lowerMsg.startsWith("fix") &&
    !lowerMsg.startsWith("wip")
  );
}

export function calculateActivity(
  commits: ReadonlyArray<Commit>,
  pullRequests: ReadonlyArray<PullRequest>,
  issues: ReadonlyArray<Issue>,
): AnalyticsActivity {
  const totalCommitsCount = commits.length;
  let totalCommitLines = 0;
  let biggestCommitNode: Commit | null = null;
  let descriptiveMessageCount = 0;

  for (const c of commits) {
    const lines = c.linesAdded + c.linesDeleted;
    totalCommitLines += lines;

    if (!biggestCommitNode || lines > biggestCommitNode.linesAdded + biggestCommitNode.linesDeleted) {
      biggestCommitNode = c;
    }

    if (isDescriptiveCommitSummary(c.summary)) {
      descriptiveMessageCount += 1;
    }
  }

  const averageLinesPerCommit =
    totalCommitsCount > 0 ? Math.round(totalCommitLines / totalCommitsCount) : 0;
  const commitMessageQualityScore =
    totalCommitsCount > 0
      ? Math.round((descriptiveMessageCount / totalCommitsCount) * 100)
      : null;

  let prOpened = 0;
  let prMerged = 0;
  let prClosed = 0;
  let biggestPrNode: PullRequest | null = null;

  for (const pr of pullRequests) {
    if (pr.status === "MERGED") prMerged += 1;
    else if (pr.status === "CLOSED") prClosed += 1;
    else prOpened += 1;

    const lines = pr.linesAdded + pr.linesDeleted;
    if (!biggestPrNode || lines > biggestPrNode.linesAdded + biggestPrNode.linesDeleted) {
      biggestPrNode = pr;
    }
  }

  const prTotal = prOpened + prMerged + prClosed;
  const mergeRate = prTotal > 0 ? parseFloat((prMerged / prTotal).toFixed(3)) : 0;

  let issueOpened = 0;
  let issueClosed = 0;
  let mostReactedIssueNode: Issue | null = null;

  for (const issue of issues) {
    if (issue.status === "CLOSED") issueClosed += 1;
    else issueOpened += 1;

    if (!mostReactedIssueNode || issue.reactionCount > mostReactedIssueNode.reactionCount) {
      mostReactedIssueNode = issue;
    }
  }

  const issueTotal = issueOpened + issueClosed;
  const closeRate = issueTotal > 0 ? parseFloat((issueClosed / issueTotal).toFixed(3)) : 0;

  const hourMap = new Array<number>(24).fill(0);
  let weekendCount = 0;
  let weekdayCount = 0;
  let nightOwlCount = 0;
  let earlyBirdCount = 0;
  let totalTimedEvents = 0;

  for (const c of commits) {
    const hour = utcHour(c.authoredAt);
    const day = utcWeekday(c.authoredAt);
    if (hour === null || day === null) continue;

    hourMap[hour] += 1;
    totalTimedEvents += 1;

    if (ANALYTICS_CONFIG.time.weekendDays.includes(day)) weekendCount += 1;
    else weekdayCount += 1;

    const isNight =
      hour >= ANALYTICS_CONFIG.time.nightStartHour || hour < ANALYTICS_CONFIG.time.nightEndHour;
    const isEarlyBird =
      hour >= ANALYTICS_CONFIG.time.earlyBirdStartHour &&
      hour < ANALYTICS_CONFIG.time.earlyBirdEndHour;

    if (isNight) nightOwlCount += 1;
    if (isEarlyBird) earlyBirdCount += 1;
  }

  let mostActiveHour: number | null = null;
  let maxHourCommits = 0;
  if (totalTimedEvents > 0) {
    for (let h = 0; h < 24; h += 1) {
      const count = hourMap[h] ?? 0;
      if (count > maxHourCommits) {
        maxHourCommits = count;
        mostActiveHour = h;
      }
    }
  }

  let morningCommits = 0;
  let afternoonCommits = 0;
  let eveningCommits = 0;
  let nightCommits = 0;
  for (let h = 0; h < 24; h += 1) {
    const count = hourMap[h] ?? 0;
    if (h >= 5 && h < 12) morningCommits += count;
    else if (h >= 12 && h < 17) afternoonCommits += count;
    else if (h >= 17 && h < 22) eveningCommits += count;
    else nightCommits += count;
  }

  let preferredCodingSession: AnalyticsActivity["timeAnalysis"]["preferredCodingSession"] = null;
  if (totalTimedEvents > 0) {
    const maxSession = Math.max(morningCommits, afternoonCommits, eveningCommits, nightCommits);
    if (maxSession === morningCommits) preferredCodingSession = "MORNING";
    else if (maxSession === afternoonCommits) preferredCodingSession = "AFTERNOON";
    else if (maxSession === eveningCommits) preferredCodingSession = "EVENING";
    else preferredCodingSession = "NIGHT";
  }

  const nightOwlPercentage =
    totalTimedEvents > 0 ? (nightOwlCount / totalTimedEvents) * 100 : 0;
  const earlyBirdPercentage =
    totalTimedEvents > 0 ? (earlyBirdCount / totalTimedEvents) * 100 : 0;

  const nightOwlScore =
    totalTimedEvents > 0
      ? createNormalizedScore(
          nightOwlPercentage,
          100,
          `Authored ${nightOwlPercentage.toFixed(1)}% of commits during late night hours (${ANALYTICS_CONFIG.time.nightStartHour}:00 - 0${ANALYTICS_CONFIG.time.nightEndHour}:00) UTC.`,
        )
      : null;

  const earlyBirdScore =
    totalTimedEvents > 0
      ? createNormalizedScore(
          earlyBirdPercentage,
          100,
          `Authored ${earlyBirdPercentage.toFixed(1)}% of commits during early morning hours (0${ANALYTICS_CONFIG.time.earlyBirdStartHour}:00 - 0${ANALYTICS_CONFIG.time.earlyBirdEndHour}:00) UTC.`,
        )
      : null;

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
      weekendActivity:
        totalTimedEvents > 0
          ? parseFloat(((weekendCount / totalTimedEvents) * 100).toFixed(2))
          : null,
      weekdayActivity:
        totalTimedEvents > 0
          ? parseFloat(((weekdayCount / totalTimedEvents) * 100).toFixed(2))
          : null,
      preferredCodingSession,
    },
  };
}
