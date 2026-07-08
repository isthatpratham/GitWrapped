"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Viewport, Container, Stack } from "@/components/layout";
import { Display, Subtitle, Button } from "@/components/ui";
import { Fade, BlurReveal } from "@/components/motion";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Viewport className="bg-[#05070b] relative flex items-center justify-center select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <Container className="text-center relative z-base">
        <Stack space={6} className="items-center">
          <BlurReveal duration={0.8}>
            <Display className="tracking-tight">404</Display>
          </BlurReveal>

          <Fade delay={0.3} duration={0.6}>
            <Subtitle className="text-muted-foreground max-w-sm">
              The story you are looking for does not exist or has been archived.
            </Subtitle>
          </Fade>

          <Fade delay={0.6} duration={0.6} className="pt-4">
            <Button onClick={() => router.push("/")} variant="primary">
              Return Home →
            </Button>
          </Fade>
        </Stack>
      </Container>
    </Viewport>
  );
}
