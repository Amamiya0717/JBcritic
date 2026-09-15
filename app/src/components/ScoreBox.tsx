import { fmtScore, tierOf } from "@/lib/format";

export default function ScoreBox({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={`score-box score-${size} ${tierOf(score)}`}>
      {fmtScore(score)}
    </div>
  );
}
