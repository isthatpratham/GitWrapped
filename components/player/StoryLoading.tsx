"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Viewport, Stack } from "@/components/layout";
import { Caption, Title } from "@/components/ui";
import { Github } from "@/components/icons";
import { loadingLine, READY_LINE } from "@/lib/player";

export function StoryLoading({ done }: { readonly done: boolean }) {
  const reduced = Boolean(useReducedMotion());
  const [elapsed, setElapsed] = useState(0);
  const line = loadingLine(elapsed, done);

  useEffect(() => {
    if (done) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      setElapsed(performance.now() - started);
    }, 200);
    return () => window.clearInterval(id);
  }, [done]);

  return (
    <Viewport className="flex items-center justify-center bg-background overflow-hidden">
      <Stack space={6} className="items-center text-center px-6 max-w-sm">
        <Github className="h-6 w-6 text-primary" aria-hidden="true" />
        <Title as="span" className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          GitWrapped
        </Title>
        <div className="h-[1px] w-10 bg-white/15" />
        <div className="min-h-[3.5rem] flex items-center" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0.15 : 0.4, ease: "easeOut" }}
              className="font-sans text-lg md:text-xl text-foreground/90 leading-snug"
            >
              {line}
            </motion.p>
          </AnimatePresence>
        </div>
        {line === READY_LINE ? (
          <Caption className="text-[10px] uppercase tracking-[0.2em] text-white/30">Entering your year</Caption>
        ) : null}
      </Stack>
    </Viewport>
  );
}
