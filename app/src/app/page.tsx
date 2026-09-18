import Link from "next/link";
import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import SpotlightCard from "@/components/SpotlightCard";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import { withStats, type Game, type Post, type Profile } from "@/lib/types";

const SPOTLIGHT_COUNT = 8;
const RECENT_POSTS_COUNT = 5;

type PostRow = Post & { profiles: Pick<Profile, "nickname"> | null };

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
    .select("*, profiles(nickname)")
    .order("created_at", { ascending: false })
    .limit(RECENT_POSTS_COUNT);

  const recentPosts = (posts ?? []) as PostRow[];

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
          {recentPosts.length === 0 ? (
            <div className="empty-state">
              <p>아직 등록된 게시글이 없어요. 첫 글을 남겨보세요.</p>
              <Link href="/board/new" className="btn btn-gold">
                글쓰기
              </Link>
            </div>
          ) : (
            <div>
              {recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/board/${p.id}`}
                  className="review-item review-item-link"
                >
                  <div className="review-body">
                    <div className="review-top">
                      <span className="review-member">{p.title}</span>
                      <span className="review-date">{fmtDate(p.created_at)}</span>
                    </div>
                    <p className="review-comment my-review-excerpt">{p.content}</p>
                    <span className="meta-text">
                      {p.profiles?.nickname ?? "탈퇴한 유저"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <GameListClient games={list} showSearch={false} />
    </>
  );
}
