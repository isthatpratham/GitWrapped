export type SlideTheme = "cyberpunk" | "neon" | "minimal" | "retro";

export interface SlideData {
  id: string;
  type: "intro" | "commits" | "languages" | "streak" | "repos" | "milestones" | "outro";
  title: string;
  subtitle?: string;
  data: Record<string, any>;
}

export interface StoryDeck {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  year: number;
  theme: SlideTheme;
  slides: SlideData[];
}
