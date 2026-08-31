import type { ShareCardStats } from "./share";

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function shareCardFileStem(handle: string, year: number): string {
  const safe = handle.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 39) || "gitwrapped";
  return `${safe}-gitwrapped-${year}`;
}

export function buildShareCardSvg(stats: ShareCardStats): string {
  const handle = escapeXml(`@${stats.handle}`);
  const year = escapeXml(String(stats.year));
  const contributions = escapeXml(stats.contributions);
  const language = escapeXml(stats.language ?? "—");
  const streak = escapeXml(String(stats.streakDays));
  const moment = stats.headline ? escapeXml(stats.headline) : null;
  const hero = stats.heroValue === null || stats.heroValue === undefined ? null : escapeXml(String(stats.heroValue));

  const momentBlock = moment
    ? `
  <text x="60" y="340" class="font-sans muted" font-size="14" letter-spacing="3">A MOMENT FROM THE YEAR</text>
  <text x="60" y="390" class="font-sans light" font-size="28">${moment}</text>
  ${hero ? `<text x="60" y="440" class="font-sans accent" font-size="22">${hero}</text>` : ""}`
    : `
  <text x="60" y="360" class="font-sans muted" font-size="14" letter-spacing="3">CONTRIBUTIONS</text>
  <text x="60" y="430" class="font-sans accent" font-size="72">${contributions}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#05070B" />
      <stop offset="100%" stop-color="#0D1117" />
    </linearGradient>
    <style>
      .font-sans { font-family: Montserrat, Helvetica, Arial, sans-serif; }
      .accent { fill: #8b5cf6; font-weight: 800; }
      .muted { fill: #6B7280; font-weight: 600; }
      .light { fill: #FFFFFF; font-weight: 700; }
    </style>
  </defs>
  <rect width="800" height="1200" fill="url(#bg)" />
  <rect x="28" y="28" width="744" height="1144" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  <text x="60" y="100" class="font-sans accent" font-size="16" letter-spacing="6">GITWRAPPED</text>
  <text x="740" y="100" text-anchor="end" class="font-sans muted" font-size="16">${year}</text>
  <text x="60" y="220" class="font-sans light" font-size="44">${handle}</text>
  <text x="60" y="262" class="font-sans muted" font-size="16">Your year in code, beautifully wrapped.</text>
  ${momentBlock}
  <text x="60" y="760" class="font-sans muted" font-size="12" letter-spacing="3">LANGUAGE</text>
  <text x="60" y="798" class="font-sans light" font-size="26">${language}</text>
  <text x="420" y="760" class="font-sans muted" font-size="12" letter-spacing="3">LONGEST STREAK</text>
  <text x="420" y="798" class="font-sans light" font-size="26">${streak} days</text>
  <line x1="60" y1="900" x2="740" y2="900" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  <text x="60" y="960" class="font-sans muted" font-size="14" letter-spacing="3">GITWRAPPED.DEV</text>
</svg>`;
}
