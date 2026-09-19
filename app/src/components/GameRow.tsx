import Link from "next/link";
import ScoreBox from "@/components/ScoreBox";
import GameThumb from "@/components/GameThumb";
import { categoryLabel, type GameWithStats } from "@/lib/types";

export default function GameRow({
  game,
  showCategoryTag = false,
}: {
  game: GameWithStats;
  showCategoryTag?: boolean;
}) {
  return (
    <Link href={`/games/${game.id}`} className="game-row">
      <GameThumb coverUrl={game.cover_url} color={game.color} title={game.title} />
      <ScoreBox score={game.avgScore} size="md" />
      <div className="game-row-body">
        <p className="game-title">{game.title}</p>
        <div className="game-meta">
          {showCategoryTag && (
            <span className="tag">{categoryLabel(game.category)}</span>
          )}
          {game.genre && <span className="tag">{game.genre}</span>}
          <span className="meta-text">리뷰 {game.reviewCount}건</span>
        </div>
      </div>
    </Link>
  );
}
