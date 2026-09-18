import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import SpotlightCard from "@/components/SpotlightCard";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import { createClient } from "@/lib/supabase/server";
import { withStats, type Game } from "@/lib/types";

const SPOTLIGHT_COUNT = 8;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("*, reviews(score)")
    .order("created_at", { ascending: false });

  const rows = (games ?? []) as (Game & { reviews: { score: number }[] })[];
  const list = rows.map((g) => {
    const { reviews, ...game } = g;
    return withStats(game, reviews);
  });
  // rows is already sorted by created_at desc, so this is the newest-first slice.
  const spotlight = rows.slice(0, SPOTLIGHT_COUNT).map((g) => ({
    stats: withStats(g, g.reviews),
    scores: g.reviews.map((r) => r.score),
  }));

  return (
    <>
      <Header />
      <div className="page">
        {spotlight.length > 0 && (
          <SpotlightCarousel title="최근 등록 게임">
            {spotlight.map(({ stats, scores }) => (
              <SpotlightCard key={stats.id} game={stats} scores={scores} />
            ))}
          </SpotlightCarousel>
        )}

        <section className="spotlight-section">
          <div className="spotlight-header">
            <h2 className="spotlight-title">게시글</h2>
          </div>
          <div className="empty-state">
            <p>게시판 기능은 준비 중이에요.</p>
          </div>
        </section>
      </div>
      <GameListClient games={list} showSearch={false} />
    </>
  );
}
