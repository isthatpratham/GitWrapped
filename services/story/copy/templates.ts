import { formatCalendarDate } from "../intelligence/signals";
import type { StoryInsight } from "../intelligence/types";

export interface StoryCopy {
  readonly title: string;
  readonly subtitle: string | null;
  readonly headline: string;
  readonly description: string;
}

export function copyForInsight(insight: StoryInsight, handle: string): StoryCopy {
  const payload = insight.payload;

  switch (payload.kind) {
    case "contribution-total":
      if (payload.total === 0) {
        return {
          title: "The Big Picture",
          subtitle: String(payload.year),
          headline: `In ${payload.year}, ${handle} logged 0 public contributions.`,
          description: "That is a measured zero from GitHub's contribution calendar, not missing data.",
        };
      }
      return {
        title: "The Big Picture",
        subtitle: String(payload.year),
        headline: `You showed up for ${payload.total.toLocaleString()} contributions.`,
        description: `${payload.year} added up in public GitHub activity — commits, pull requests, issues, and reviews counted together.`,
      };

    case "longest-streak":
      return {
        title: "Consistency",
        subtitle: "Longest streak",
        headline: `You stayed in the game for ${payload.days} days in a row.`,
        description: payload.startDate && payload.endDate
          ? `That streak ran ${formatCalendarDate(payload.startDate)} to ${formatCalendarDate(payload.endDate)}. You were active on ${payload.activeDays} days overall.`
          : `You were active on ${payload.activeDays} days across the year.`,
      };

    case "peak-day":
      return {
        title: "Peak Mode",
        subtitle: formatCalendarDate(payload.date),
        headline: `${formatCalendarDate(payload.date)} was your biggest coding day.`,
        description: payload.repositoryPath
          ? `${payload.count} contributions landed that day, with ${payload.repositoryPath} producing the most commits we could attribute.`
          : `${payload.count} contributions landed that day. GitHub did not attribute that calendar day to a single repository.`,
      };

    case "peak-repository":
      return {
        title: "Peak Day Repository",
        subtitle: payload.repositoryPath,
        headline: `${payload.repositoryPath} saw the most activity on your biggest day.`,
        description: `On ${formatCalendarDate(payload.date)}, most attributed commits on that UTC date went to this repository.`,
      };

    case "most-starred-repository":
      return {
        title: "Most Starred",
        subtitle: `${payload.ownerName}/${payload.name}`,
        headline: `${payload.ownerName}/${payload.name} was your most-starred public repository.`,
        description: `${payload.starCount.toLocaleString()} stars on that repository. Star count is not how much you committed there.`,
      };

    case "night-activity":
      return {
        title: "Night Owl",
        subtitle: "UTC coding hours",
        headline: "Your strongest timed commits happened after hours.",
        description: `${payload.percentage}% of commits with timestamps landed in late hours. The busiest UTC hour was ${payload.mostActiveHour}:00.`,
      };

    case "weekend-activity":
      return {
        title: "Weekend Rhythm",
        subtitle: "UTC weekends",
        headline: `Weekends carried ${payload.percentage}% of your timed commits.`,
        description: "That share is high relative to a two-day weekend, based on commit timestamps rather than the contribution calendar.",
      };

    case "language-dominance":
      return {
        title: "Your Language",
        subtitle: "Detected volume",
        headline: `${payload.name} became the bulk of your detected code.`,
        description: `${payload.percentage}% of language bytes GitHub reported across your repositories. That is repository language metadata, not an exact line count.`,
      };

    case "language-evolution":
      return {
        title: "Language Shift",
        subtitle: String(payload.recapYear),
        headline: `${payload.toLanguage} took over from ${payload.fromLanguage}.`,
        description: `Repositories created before ${payload.recapYear} leaned ${payload.fromLanguage}. This year's detected volume is led by ${payload.toLanguage}.`,
      };

    case "repository-concentration":
      return {
        title: "Main Character Project",
        subtitle: payload.repositoryName,
        headline: `${payload.repositoryName} accounted for ${payload.sharePercent}% of recorded commits.`,
        description: payload.owned
          ? `${payload.commitCount} commits in that repository show up in this year's contribution breakdown.`
          : `${payload.commitCount} commits were recorded there. That measures commit volume, not that you created the repository.`,
      };

    case "monthly-growth":
      return {
        title: "Momentum",
        subtitle: payload.peakMonthName,
        headline: "Later months carried more of the year than the start.",
        description: `Fourth-quarter activity was ${payload.momentum}× the first quarter. Peak month: ${payload.peakMonthName}.`,
      };

    case "comeback":
      return {
        title: "The Comeback",
        subtitle: formatCalendarDate(payload.reboundStart),
        headline: "You disappeared. Then you came back swinging.",
        description: `${payload.quietDays} quiet days, then ${payload.reboundCount} contributions in the week starting ${formatCalendarDate(payload.reboundStart)}. That rebound sits against a typical week of ${payload.typicalWeekly} on the contribution calendar.`,
      };

    case "final-push":
      return {
        title: "The Final Push",
        subtitle: formatCalendarDate(payload.windowEnd),
        headline: "You didn't quietly disappear at the finish line.",
        description: `${payload.windowCount} contributions landed ${formatCalendarDate(payload.windowStart)}–${formatCalendarDate(payload.windowEnd)}, ${payload.yearSharePercent}% of the year and ${payload.windowAverageDaily} a day versus ${payload.restAverageDaily} earlier.`,
      };

    case "contribution-milestone":
      return {
        title: "Milestone",
        subtitle: payload.threshold.toLocaleString(),
        headline: `You crossed ${payload.threshold.toLocaleString()}.`,
        description: `The contribution calendar first reached ${payload.threshold.toLocaleString()} on ${formatCalendarDate(payload.crossedOn)}. Year total: ${payload.total.toLocaleString()}.`,
      };

    case "first-repository":
      return {
        title: "First Repository",
        subtitle: `${payload.ownerName}/${payload.name}`,
        headline: "Your year started with an idea.",
        description: payload.ownedByUser
          ? `${payload.ownerName}/${payload.name} was created ${formatCalendarDate(payload.createdAt.slice(0, 10))}. That is repository creation date, not a claim about how much you committed there.`
          : `${payload.ownerName}/${payload.name} appeared ${formatCalendarDate(payload.createdAt.slice(0, 10))}. Creation date is available; this does not establish that you built every line.`,
      };

    case "open-source":
      return {
        title: "Open Source",
        subtitle: payload.featuredRepositoryPath,
        headline: "You didn't just build your own stuff.",
        description: [
          `${payload.pullRequestCount} pull requests and ${payload.commitCount} commits reached ${payload.uniqueRepositoryCount} repositor${payload.uniqueRepositoryCount === 1 ? "y" : "ies"} you don't own.`,
          payload.featuredRepositoryPath ? `Most of that external signal pointed at ${payload.featuredRepositoryPath}.` : null,
          "That measures activity outside your handle, not that you created those projects.",
        ]
          .filter((part): part is string => Boolean(part))
          .join(" "),
      };

    case "commit-personality": {
      const headlines: Record<typeof payload.archetype, string> = {
        fixer: "A lot of the year's commits were about fixing.",
        builder: "feat showed up so often it became a pattern.",
        refactorer: "Refactor kept turning up in the commit log.",
        "final-final": "The Final Final Engineer clocked in.",
        keyword: `"${payload.keyword}" kept turning up in commit summaries.`,
      };
      return {
        title: "Commit Voice",
        subtitle: payload.keyword,
        headline: headlines[payload.archetype],
        description: `${payload.matchCount} of ${payload.sampleSize} counted commit summaries matched “${payload.keyword}” (${payload.sharePercent}%). This is a word pattern, not a personality diagnosis, and full messages stay off the slide.`,
      };
    }

    case "activity-spike":
      return {
        title: "Activity Spike",
        subtitle: formatCalendarDate(payload.date),
        headline: `${formatCalendarDate(payload.date)} jumped far above a typical active day.`,
        description: `${payload.count} contributions versus an average active-day count of ${payload.average}.`,
      };

    case "developer-rhythm":
      return {
        title: "Your Rhythm",
        subtitle: payload.rhythm,
        headline: `This year's GitHub activity reads as ${payload.rhythm}.`,
        description: payload.reason,
      };

    case "achievements":
      return {
        title: "Milestones",
        subtitle: `${payload.achievements.length} unlocked`,
        headline: `You unlocked ${payload.achievements.length} evidence-backed milestone${payload.achievements.length === 1 ? "" : "s"}.`,
        description: payload.achievements.map((item) => item.title).join(" · "),
      };

    case "organizations":
      return {
        title: "Collaborations",
        subtitle: "Public memberships",
        headline: `You were a public member of ${payload.count} organization${payload.count === 1 ? "" : "s"}.`,
        description: `Including ${payload.featuredName ?? payload.featuredHandle}. This is membership, not a claim about how much you committed there.`,
      };
  }
}

export function welcomeCopy(handle: string, displayName: string | null, year: number): StoryCopy {
  const name = displayName ?? handle;
  return {
    title: "Welcome",
    subtitle: String(year),
    headline: `Hey, ${name}.`,
    description: `Let's rewind ${year}. Everything here is drawn from public GitHub activity we could actually measure.`,
  };
}

export function closingCopy(year: number): StoryCopy {
  return {
    title: "Wrapping Up",
    subtitle: String(year),
    headline: `That's your ${year} in public GitHub activity.`,
    description: `Keep building. See you in ${year + 1}.`,
  };
}
