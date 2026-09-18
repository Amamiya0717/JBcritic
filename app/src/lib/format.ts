export function tierOf(score: number | null): string {
  if (score == null) return "tier-none";
  if (score >= 75) return "tier-good";
  if (score >= 50) return "tier-mid";
  return "tier-low";
}

export function fmtScore(score: number | null): string {
  return score == null ? "–" : String(score);
}

export function tierLabel(score: number | null): string {
  if (score == null) return "아직 평가 없음";
  if (score >= 75) return "호평 일색";
  if (score >= 50) return "호불호 갈림";
  return "혹평";
}

export function tierDistribution(scores: number[]): {
  good: number;
  mid: number;
  low: number;
} {
  if (scores.length === 0) return { good: 0, mid: 0, low: 0 };
  let good = 0;
  let mid = 0;
  let low = 0;
  for (const s of scores) {
    if (s >= 75) good++;
    else if (s >= 50) mid++;
    else low++;
  }
  const total = scores.length;
  return {
    good: (good / total) * 100,
    mid: (mid / total) * 100,
    low: (low / total) * 100,
  };
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

// 24시간 이내면 시:분(24시간제), 그 이전이면 fmtDate와 동일한 연/월/일 형식.
export function fmtRecentDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return fmtDate(iso);
}

export function initials(title: string): string {
  const t = (title || "").trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}
