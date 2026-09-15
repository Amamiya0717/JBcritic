export function tierOf(score: number | null): string {
  if (score == null) return "tier-none";
  if (score >= 7.5) return "tier-good";
  if (score >= 5.0) return "tier-mid";
  return "tier-low";
}

export function fmtScore(score: number | null): string {
  return score == null ? "–" : score.toFixed(1);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export function initials(title: string): string {
  const t = (title || "").trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}
