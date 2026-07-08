"use client";

// ---------------------------------------------------------------------------
// Page: Home (Opening Experience)
// ---------------------------------------------------------------------------
// The opening scene of GitWrapped.
//
// Pacing Flow:
// 0.0s: GitWrapped logo fades in.
// 0.4s: Headline "Your year in code. Beautifully wrapped." appears.
// 1.2s: Subheadline "Every project. Every late night..." appears.
// 2.0s: Username search input and "Begin Your Story" button fade in.
// ---------------------------------------------------------------------------

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Viewport, Container, Stack, Flex } from "@/components/layout";
import { Display, Subtitle, Caption, Title, Button, SearchInput } from "@/components/ui";
import { Fade, FadeUp, BlurReveal } from "@/components/motion";
import { Github } from "@/components/icons";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(username);
  };

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a username to begin.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/wrapped/${trimmed}`);
  };

  return (
    <Viewport className="bg-[#02040a] relative select-none">
      {/* Subtle dotted grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      <Container className="h-full flex items-center justify-center relative">
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <Stack space={8} className="items-center text-center">
            {/* 1. GitWrapped Logo */}
            <Fade delay={0.2} duration={0.6}>
              <Flex className="gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <Github className="h-4 w-4 text-primary" />
                <Title as="span" className="text-xs uppercase tracking-[0.3em] font-semibold">
                  GitWrapped
                </Title>
              </Flex>
            </Fade>

            {/* 2. Main Editorial Headline */}
            <Stack space={3}>
              <BlurReveal delay={0.6} duration={0.8}>
                <Display className="tracking-tight leading-[1.05]">
                  Your year in code.
                  <br />
                  <span className="text-muted-foreground">Beautifully wrapped.</span>
                </Display>
              </BlurReveal>
            </Stack>

            {/* 3. Subheadline Narrative */}
            <FadeUp delay={1.4} duration={0.6}>
              <Subtitle className="max-w-md text-sm md:text-base leading-relaxed font-normal text-muted-foreground/80">
                Every project. Every late night. Every milestone.
                <br />
                Waiting to be rediscovered.
              </Subtitle>
            </FadeUp>

            {/* 4. Action Input & Button */}
            <FadeUp delay={2.2} duration={0.6} className="w-full max-w-sm">
              <Stack space={4}>
                <SearchInput
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  onSearch={handleSearch}
                  placeholder="Enter your GitHub username"
                  error={error}
                  disabled={loading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="text-center pl-4 pr-4" // center text inside input
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-3.5"
                >
                  Begin Your Story →
                </Button>

                {/* Footnote */}
                <Stack space={1} className="pt-2">
                  <Caption className="text-[10px] text-muted-foreground/60">
                    No account required.
                  </Caption>
                  <Caption className="text-[10px] text-muted-foreground/60">
                    We only use your public GitHub activity.
                  </Caption>
                </Stack>
              </Stack>
            </FadeUp>
          </Stack>
        </form>
      </Container>
    </Viewport>
  );
}
