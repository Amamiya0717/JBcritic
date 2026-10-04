import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ScoreBox from "@/components/ScoreBox";
import GameThumb from "@/components/GameThumb";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import DeleteGameButton from "@/components/DeleteGameButton";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import {
  CATEGORY_FIELDS,
  categoryPath,
  withStats,
  type Game,
  type Review,
} from "@/lib/types";

export default async function GameDetailPage(props: PageProps<"/games/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (!game) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(id, nickname, created_at)")
    .eq("game_id", id);

  const reviewList = (reviews ?? []) as Review[];
  const stats = withStats(game as Game, reviewList);
  const myReview = user ? reviewList.find((r) => r.user_id === user.id) : undefined;
  const canEdit =
    !!user && (user.id === stats.added_by || (await isAdmin(supabase)));

  return (
    <>
      <Header />
      <div className="page">
        <Link href={categoryPath(stats.category)} className="back-link btn-text">
          ← 목록으로
        </Link>

        <div className="detail-card">
          <GameThumb
            coverUrl={stats.cover_url}
            color={stats.color}
            title={stats.title}
            variant="detail"
          />
          <ScoreBox score={stats.avgScore} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 className="detail-title">{stats.title}</h2>
            <div className="detail-meta">
              {stats.genre && <span className="tag">{stats.genre}</span>}
              {CATEGORY_FIELDS[stats.category].map((f) => {
                const value = stats[f.key];
                if (!value) return null;
                return (
                  <span key={f.key} className="tag">
                    {f.label}: {f.type === "date" ? fmtDate(String(value)) : value}
                  </span>
                );
              })}
              <span className="meta-text">{fmtDate(stats.created_at)} 등록</span>
              <span className="meta-text">리뷰 {stats.reviewCount}건</span>
            </div>
            {stats.description && (
              <p className="detail-desc">{stats.description}</p>
            )}
            {canEdit && (
              <div className="review-actions" style={{ marginTop: 10 }}>
                <Link href={`/games/${id}/edit`} className="review-edit">
                  수정
                </Link>
                <DeleteGameButton gameId={id} category={stats.category} />
              </div>
            )}
          </div>
        </div>

        {!user && (
          <>
            <h3 className="section-title">평가 남기기</h3>
            <div className="empty-state" style={{ marginBottom: 24 }}>
              <p>평가를 남기려면 로그인해주세요.</p>
              <Link href="/login" className="btn btn-gold">
                로그인
              </Link>
            </div>
          </>
        )}
        {user && !myReview && (
          <>
            <h3 className="section-title">평가 남기기</h3>
            <ReviewForm gameId={id} />
          </>
        )}

        <h3 className="section-title">유저 평가 ({reviewList.length})</h3>
        <ReviewList gameId={id} reviews={reviewList} currentUserId={user?.id ?? null} />
      </div>
    </>
  );
}
