"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWrappedStoryDeck } from "@/app/actions/wrapped";
import type { Story } from "@/services/story";
import { Viewport } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { StoryLoading } from "@/components/player/StoryLoading";
import { StoryPlayer } from "@/components/player/StoryPlayer";
import { recapErrorCode, recapErrorCopy, shouldEnterStory } from "@/lib/player";

export default function WrappedPlayerPage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [readyElapsed, setReadyElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorCode(null);
    setStory(null);
    setReadyElapsed(0);

    void (async () => {
      try {
        const decodedUsername = decodeURIComponent(id);
        const deck = await getWrappedStoryDeck(decodedUsername);
        if (cancelled) return;
        setStory(deck);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        setErrorCode(recapErrorCode(error));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  useEffect(() => {
    if (loading || errorCode || !story) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      setReadyElapsed(performance.now() - started);
    }, 50);
    return () => window.clearInterval(timer);
  }, [loading, errorCode, story]);

  if (errorCode) {
    const copy = recapErrorCopy(errorCode);
    return (
      <Viewport className="flex items-center justify-center bg-background p-4">
        <ErrorState
          title={copy.title}
          description={copy.description}
          onRetry={copy.retryable ? () => setAttempt((value) => value + 1) : () => router.push("/")}
        />
      </Viewport>
    );
  }

  if (loading || !story || !shouldEnterStory(true, readyElapsed)) {
    return <StoryLoading done={!loading && Boolean(story)} />;
  }

  return <StoryPlayer story={story} onClose={() => router.push("/")} />;
}
