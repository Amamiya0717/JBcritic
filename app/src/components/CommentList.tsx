"use client";

import { useTransition } from "react";
import { fmtDate } from "@/lib/format";
import { deleteComment } from "@/lib/actions";
import type { Comment } from "@/lib/types";

export default function CommentList({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const sorted = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  function handleDelete(commentId: string) {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    startTransition(() => {
      deleteComment(postId, commentId);
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="empty-state">
        <p>아직 댓글이 없어요.</p>
      </div>
    );
  }

  return (
    <div>
      {sorted.map((c) => (
        <div key={c.id} className="review-item">
          <div className="review-body">
            <div className="review-top">
              <span className="review-member">
                {c.profiles?.nickname ?? "탈퇴한 유저"}
              </span>
              <span className="review-date">{fmtDate(c.created_at)}</span>
            </div>
            <p className="review-comment">{c.content}</p>
            {currentUserId === c.user_id && (
              <div className="review-actions">
                <button
                  className="review-del"
                  disabled={pending}
                  onClick={() => handleDelete(c.id)}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
