"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions";

export default function ReviewForm({
  gameId,
  initialScore,
  initialComment,
  onSuccess,
  onCancel,
}: {
  gameId: string;
  initialScore?: number;
  initialComment?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await submitReview(gameId, formData);
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }

  return (
    <form action={handleSubmit} className="review-form">
      {error && <p className="form-error">{error}</p>}
      <div className="form-row">
        <div className="field score-field">
          <label htmlFor="score">점수 (0~100)</label>
          <input
            className="input"
            id="score"
            name="score"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="85"
            defaultValue={initialScore}
          />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="comment">리뷰</label>
        <textarea
          className="input review-textarea"
          id="comment"
          name="comment"
          rows={5}
          placeholder="이 게임에 대한 생각을 자유롭게 남겨주세요"
          defaultValue={initialComment}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "저장 중..." : initialScore != null ? "평가 수정" : "평가 등록"}
      </button>
      {onCancel && (
        <button
          type="button"
          className="btn-text"
          style={{ marginLeft: 10 }}
          onClick={onCancel}
        >
          취소
        </button>
      )}
    </form>
  );
}
