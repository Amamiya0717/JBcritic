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

// 서버 실행 환경(Vercel은 UTC)과 무관하게 항상 한국 시간(KST) 기준으로 계산한다.
function kstParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function fmtDate(iso: string): string {
  const { year, month, day } = kstParts(iso);
  return `${year}.${month}.${day}`;
}

// 24시간 이내면 시:분(24시간제, KST), 그 이전이면 fmtDate와 동일한 연/월/일 형식.
export function fmtRecentDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
    const { hour, minute } = kstParts(iso);
    return `${hour}:${minute}`;
  }
  return fmtDate(iso);
}

export function initials(title: string): string {
  const t = (title || "").trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}
