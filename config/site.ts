import "server-only";

import { z } from "zod";

// Public site URL only. GitHub credentials live in sdk/github/config.ts
// (server-only) and must never be imported from this module on the client.
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const validateEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
  });

  if (!parsed.success) {
    const issueSummary = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}:${issue.code}`)
      .join(", ");
    console.error(`Invalid public environment configuration (${issueSummary}).`);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
    return {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
  }

  return parsed.data;
};

const env = validateEnv();

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
