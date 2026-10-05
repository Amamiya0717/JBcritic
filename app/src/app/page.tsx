import Link from "next/link";
import Header from "@/components/Header";
import SpotlightCard from "@/components/SpotlightCard";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import RecentPostsList, { type RecentPostRow } from "@/components/RecentPostsList";
import { createClient } from "@/lib/supabase/server";
import { fetchGamesWithScoresByCategory, type GameWithScores } from "@/lib/games";
import {
  GAME_CATEGORIES,
  categoryPath,
  type GameCategory,
  type Post,
  type Profile,
} from "@/lib/types";

const SPOTLIGHT_COUNT = 8;
const RECENT_POSTS_COUNT = 20;

const SECTION_LABELS: Record<GameCategory, string> = {
  game: "게임",
  anime: "애니메이션",
  movies: "영화",
  music: "음악",
  lives: "공연",
};

type PostRow = Post & {
  profiles: Pick<Profile, "nickname"> | null;
  comments: { id: string }[];
};

function topRated(rows: GameWithScores[]): GameWithScores[] {
  return [...rows]
    .filter((r) => r.stats.avgScore !== null)
    .sort((a, b) => (b.stats.avgScore as number) - (a.stats.avgScore as number))
    .slice(0, SPOTLIGHT_COUNT);
}

export default async function HomePage() {
  const supabase = await createClient();

  const byCategory = await Promise.all(
    GAME_CATEGORIES.map(async (c) => ({
      category: c.value,
      // fetchGamesWithScoresByCategory already orders by created_at desc.
      rows: await fetchGamesWithScoresByCategory(supabase, c.value),
    }))
  );

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
        {byCategory.map(({ category, rows }) => {
          const recent = rows.slice(0, SPOTLIGHT_COUNT);
          if (recent.length === 0) return null;
          return (
            <SpotlightCarousel
              key={`recent-${category}`}
              title={`최근 등록 ${SECTION_LABELS[category]}`}
              moreHref={`${categoryPath(category)}?sort=recent`}
            >
              {recent.map(({ stats, scores }) => (
                <SpotlightCard key={stats.id} game={stats} scores={scores} />
              ))}
            </SpotlightCarousel>
          );
        })}

        {byCategory.map(({ category, rows }) => {
          const top = topRated(rows);
          if (top.length === 0) return null;
          return (
            <SpotlightCarousel
              key={`top-${category}`}
              title={`최고 평점 ${SECTION_LABELS[category]}`}
              moreHref={`${categoryPath(category)}?sort=score-desc`}
            >
              {top.map(({ stats, scores }) => (
                <SpotlightCard key={stats.id} game={stats} scores={scores} />
              ))}
            </SpotlightCarousel>
          );
        })}

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
    </>
  );
}
