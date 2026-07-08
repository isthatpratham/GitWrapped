export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  createdAt: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface LanguageStats {
  name: string;
  color: string;
  size: number;
}

export interface RepositoryHighlight {
  name: string;
  owner: string;
  starCount: number;
  forkCount: number;
  primaryLanguage: string | null;
  commitCount: number;
}
