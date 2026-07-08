import { z } from "zod";

// Zod Schema to validate environment variables
const envSchema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1, "GitHub Client ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GitHub Client Secret is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Environment variable validation helper
const validateEnv = () => {
  const parsed = envSchema.safeParse({
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    // In production, we fail-fast. In development, we warn.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
    return {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
  }

  return parsed.data;
};

export const env = validateEnv();

export const siteConfig = {
  name: "GitWrapped",
  description: "Transform your public GitHub activity into a beautiful, story-driven annual recap.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og-image.png`,
  links: {
    github: "https://github.com/gitwrapped",
  },
  seo: {
    defaultTitle: "GitWrapped - Your Year in Code, Beautifully Wrapped",
    titleTemplate: "%s | GitWrapped",
  },
};
