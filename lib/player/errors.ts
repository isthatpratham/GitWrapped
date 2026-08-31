export interface RecapErrorCopy {
  readonly title: string;
  readonly description: string;
  readonly retryable: boolean;
}

const COPY: Record<string, RecapErrorCopy> = {
  INVALID_USERNAME: {
    title: "That name doesn't look right",
    description: "Check the GitHub username and try again.",
    retryable: false,
  },
  USER_NOT_FOUND: {
    title: "We couldn't find that developer",
    description: "No public GitHub profile matched that username.",
    retryable: false,
  },
  RATE_LIMIT: {
    title: "GitHub asked us to wait",
    description: "Try again in a little while.",
    retryable: true,
  },
  AUTH_FAILED: {
    title: "We couldn't reach GitHub",
    description: "Please try again later.",
    retryable: true,
  },
  MALFORMED_RESPONSE: {
    title: "GitHub sent something unexpected",
    description: "Please try again in a moment.",
    retryable: true,
  },
  FETCH_FAILED: {
    title: "Your story couldn't load",
    description: "Check your connection and try again.",
    retryable: true,
  },
};

const FALLBACK: RecapErrorCopy = {
  title: "Your story couldn't load",
  description: "Please try again.",
  retryable: true,
};

export function recapErrorCopy(code: string | null | undefined): RecapErrorCopy {
  if (!code) return FALLBACK;
  return COPY[code] ?? FALLBACK;
}

export function recapErrorCode(error: unknown): string {
  if (error instanceof Error && error.message) {
    const first = error.message.split("\n")[0]?.trim() ?? "";
    if (first in COPY) return first;
  }
  return "FETCH_FAILED";
}
