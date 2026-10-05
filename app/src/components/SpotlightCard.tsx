import Link from "next/link";
import GameThumb from "@/components/GameThumb";
import { fmtScore, tierDistribution, tierLabel, tierOf } from "@/lib/format";
import { categoryLabel, type GameWithStats } from "@/lib/types";

export default function SpotlightCard({
  game,
  scores,
}: {
  game: GameWithStats;
  scores: number[];
}) {
  const tier = tierOf(game.avgScore);
  const dist = tierDistribution(scores);
  const segments = [
    { key: "good", width: dist.good, color: "var(--tier-good)" },
    { key: "mid", width: dist.mid, color: "var(--tier-mid)" },
    { key: "low", width: dist.low, color: "var(--tier-low)" },
  ].filter((seg) => seg.width > 0);

  return (
    <Link href={`/games/${game.id}`} className="meta-card">
      <div className={`meta-card-media ${tier}`}>
        <GameThumb
          coverUrl={game.cover_url}
          color={game.color}
          title={game.title}
          variant="wide"
        />
      </div>
      <div className="meta-card-body">
        <p className="meta-card-title">{game.title}</p>
        <span className="tag">{categoryLabel(game.category)}</span>
      </div>
      <div className="meta-card-score">
        <p className="meta-card-score-label">JB SCORE</p>
        <div className="meta-card-score-row">
          <div>
            <p className="meta-card-descriptor">{tierLabel(game.avgScore)}</p>
            <p className="meta-card-reviews">리뷰 {game.reviewCount}건</p>
          </div>
          <div className={`score-box score-lg ${tier}`}>{fmtScore(game.avgScore)}</div>
        </div>
        <div className="meta-card-bar">
          {segments.length > 0 ? (
            segments.map((seg) => (
              <span key={seg.key} style={{ width: `${seg.width}%`, background: seg.color }} />
            ))
          ) : (
            <span style={{ width: "100%", background: "var(--border)" }} />
          )}
        </div>
      </div>
    </Link>
  );
}
