import Link from "next/link";
import Header from "@/components/Header";
import MyPageTabs from "@/components/MyPageTabs";
import ScoreBox from "@/components/ScoreBox";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, fmtRecentDate } from "@/lib/format";

type MyReview = {
  id: string;
  game_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  games: { title: string } | null;
};

type MyPost = {
  id: string;
  title: string;
  created_at: string;
  comments: { id: string }[];
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Header />
        <div className="page">
          <div className="empty-state">
            <p>마이페이지는 로그인 후 이용할 수 있어요.</p>
            <Link href="/login" className="btn btn-gold">
              로그인
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, game_id, score, comment, created_at, games(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const myReviews = (reviews ?? []) as unknown as MyReview[];

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at, comments(id)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const myPosts = (posts ?? []) as MyPost[];

  return (
    <>
      <Header />
      <div className="page">
        <MyPageTabs active="reviews" />

        <h4 className="section-title" style={{ fontSize: "0.78rem" }}>
          내가 쓴 평가 ({myReviews.length})
        </h4>
        {myReviews.length === 0 ? (
          <div className="empty-state">
            <p>아직 남긴 평가가 없어요.</p>
          </div>
        ) : (
          <div>
            {myReviews.map((r) => (
              <Link
                key={r.id}
                href={`/games/${r.game_id}`}
                className="review-item review-item-link"
              >
                <ScoreBox score={r.score} size="sm" />
                <div className="review-body">
                  <div className="review-top">
                    <span className="review-member">
                      {r.games?.title ?? "삭제된 게임"}
                    </span>
                    <span className="review-date">{fmtDate(r.created_at)}</span>
                  </div>
                  {r.comment && (
                    <p className="review-comment my-review-excerpt">{r.comment}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <h4
          className="section-title"
          style={{ fontSize: "0.78rem", marginTop: 24 }}
        >
          내가 쓴 게시판 글 ({myPosts.length})
        </h4>
        {myPosts.length === 0 ? (
          <div className="empty-state">
            <p>아직 작성한 글이 없어요.</p>
          </div>
        ) : (
          <div>
            {myPosts.map((p) => (
              <Link
                key={p.id}
                href={`/board/${p.id}`}
                className="review-item review-item-link"
              >
                <div className="review-body">
                  <div className="review-top">
                    <span className="review-member">
                      {p.title} <span className="meta-text">[{p.comments.length}]</span>
                    </span>
                    <span className="review-date">{fmtRecentDate(p.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
