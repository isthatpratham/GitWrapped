import type { Metadata } from "next";

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ readonly id: string }>;
}

export async function generateMetadata({ params }: { readonly params: Promise<{ readonly id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const username = decodeURIComponent(id);

  return {
    title: `@${username}'s GitWrapped — Your Year in Code, Beautifully Wrapped`,
    description: `Discover @${username}'s top programming languages, longest coding streaks, and annual GitHub recap achievements.`,
    alternates: {
      canonical: `/wrapped/${id}`,
    },
    openGraph: {
      title: `@${username}'s GitWrapped — Your Year in Code, Beautifully Wrapped`,
      description: `Discover @${username}'s top programming languages, longest coding streaks, and annual GitHub recap achievements.`,
      url: `https://gitwrapped.dev/wrapped/${id}`,
      type: "video.other", // Fits dynamic storytelling recap
    },
    twitter: {
      title: `@${username}'s GitWrapped — Your Year in Code, Beautifully Wrapped`,
      description: `Discover @${username}'s top programming languages, longest coding streaks, and annual GitHub recap achievements.`,
    },
  };
}

export default function WrappedUserLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
