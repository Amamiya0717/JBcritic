"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions";

export default function ReviewForm({
  gameId,
  initialScore,
  initialComment,
}: {
  gameId: string;
  initialScore?: number;
  initialComment?: string;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await submitReview(gameId, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="review-form">
      {error && <p className="form-error">{error}</p>}
      <div className="form-row">
        <div className="field score-field">
          <label htmlFor="score">점수 (0~10)</label>
          <input
            className="input"
            id="score"
            name="score"
            type="number"
            min={0}
            max={10}
            step={0.1}
            placeholder="8.5"
            defaultValue={initialScore}
          />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="comment">코멘트</label>
        <textarea
          className="input"
          id="comment"
          name="comment"
          placeholder="한줄평을 남겨주세요"
          defaultValue={initialComment}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "등록 중..." : initialScore != null ? "평가 수정" : "평가 등록"}
      </button>
    </form>
  );
}
