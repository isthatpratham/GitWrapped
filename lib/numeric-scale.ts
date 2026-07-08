// ---------------------------------------------------------------------------
// Utility: Fluid numeric font sizing
// ---------------------------------------------------------------------------
// Returns a Tailwind text-size class string based on the digit count of a
// numeric value, scaling down as digit count increases so numbers never
// overflow, clip, or break their containers.
// ---------------------------------------------------------------------------

/**
 * Returns responsive Tailwind text-size class(es) for a numeric value.
 * Scales down automatically as the number of digits increases.
 *
 * | Digits | Example  | Classes              |
 * |--------|----------|----------------------|
 * | 1-2    | 7, 42    | text-5xl md:text-7xl |
 * | 3      | 278      | text-4xl md:text-6xl |
 * | 4      | 1,024    | text-3xl md:text-5xl |
 * | 5      | 12,567   | text-2xl md:text-4xl |
 * | 6+     | 999,999  | text-xl  md:text-3xl |
 */
export function getNumericSizeClass(value: number): string {
  const digits = Math.abs(Math.floor(value)).toString().length;

  if (digits <= 2) return "text-5xl md:text-7xl";
  if (digits === 3) return "text-4xl md:text-6xl";
  if (digits === 4) return "text-3xl md:text-5xl";
  if (digits === 5) return "text-2xl md:text-4xl";
  return "text-xl md:text-3xl";
}

/**
 * Returns a responsive Tailwind text-size class for repository/identifier names
 * based on character length. Scales down for long repo paths like owner/name.
 *
 * | Length  | Example                          | Classes        |
 * |---------|----------------------------------|----------------|
 * | <= 20   | torvalds/linux                   | text-sm        |
 * | <= 30   | vercel/next.js                   | text-xs        |
 * | <= 50   | some-org/super-long-repo-name    | text-[11px]    |
 * | 50+     | some-long-org/super-long-repo    | text-[10px]    |
 */
export function getRepoNameSizeClass(name: string): string {
  const len = name.length;
  if (len <= 20) return "text-sm";
  if (len <= 30) return "text-xs";
  if (len <= 50) return "text-[11px]";
  return "text-[10px]";
}
