import Link from "next/link";
import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import SpotlightCard from "@/components/SpotlightCard";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import RecentPostsList, { type RecentPostRow } from "@/components/RecentPostsList";
import { createClient } from "@/lib/supabase/server";
import { withStats, type Game, type Post, type Profile } from "@/lib/types";

const SPOTLIGHT_COUNT = 8;
const RECENT_POSTS_COUNT = 20;

type PostRow = Post & {
  profiles: Pick<Profile, "nickname"> | null;
  comments: { id: string }[];
};

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

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname), comments(id)")
    .order("created_at", { ascending: false })
    .limit(RECENT_POSTS_COUNT);

  const recentPosts: RecentPostRow[] = ((posts ?? []) as PostRow[]).map((p) => {
    const { comments, ...post } = p;
    return { ...post, commentCount: comments.length };
  });

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
            <Link href="/board" className="btn-text">
              게시판 전체보기 →
            </Link>
          </div>
          <RecentPostsList posts={recentPosts} />
        </section>
      </div>
      <GameListClient games={list} showSearch={false} />
    </>
  );
}
