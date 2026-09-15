import Link from "next/link";
import GameThumb from "@/components/GameThumb";
import { fmtScore, tierDistribution, tierLabel, tierOf } from "@/lib/format";
import type { GameWithStats } from "@/lib/types";

export default function SpotlightCard({
  game,
  scores,
}: {
  game: GameWithStats;
  scores: number[];
}) {
  const tier = tierOf(game.avgScore);
  const dist = tierDistribution(scores);

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
        <span className="tag">game</span>
      </div>
      <div className="meta-card-score">
        <p className="meta-card-score-label">JB SCORE</p>
        <div className="meta-card-score-row">
          <div className={`score-box score-lg ${tier}`}>{fmtScore(game.avgScore)}</div>
          <div>
            <p className="meta-card-descriptor">{tierLabel(game.avgScore)}</p>
            <p className="meta-card-reviews">리뷰 {game.reviewCount}건</p>
          </div>
        </div>
        <div className="meta-card-bar">
          <span style={{ width: `${dist.good}%`, background: "var(--green-dark)" }} />
          <span style={{ width: `${dist.mid}%`, background: "var(--mid-dark)" }} />
          <span style={{ width: `${dist.low}%`, background: "var(--red-dark)" }} />
        </div>
      </div>
    </Link>
  );
}
