"use client";

import { useTransition } from "react";
import ScoreBox from "@/components/ScoreBox";
import { fmtDate } from "@/lib/format";
import { deleteReview } from "@/lib/actions";
import type { Review } from "@/lib/types";

export default function ReviewList({
  gameId,
  reviews,
  currentUserId,
}: {
  gameId: string;
  reviews: Review[];
  currentUserId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  function handleDelete(reviewId: string) {
    if (!confirm("이 평가를 삭제할까요?")) return;
    startTransition(() => {
      deleteReview(gameId, reviewId);
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="empty-state">
        <p>아직 아무도 평가하지 않았어요.</p>
      </div>
    );
  }

  return (
    <div>
      {sorted.map((r) => (
        <div key={r.id} className="review-item">
          <ScoreBox score={r.score} size="sm" />
          <div className="review-body">
            <div className="review-top">
              <span className="review-member">
                {r.profiles?.nickname ?? "탈퇴한 유저"}
              </span>
              <span className="review-date">{fmtDate(r.created_at)}</span>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
            {currentUserId === r.user_id && (
              <button
                className="review-del"
                disabled={pending}
                onClick={() => handleDelete(r.id)}
              >
                삭제
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
