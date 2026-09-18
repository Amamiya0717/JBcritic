"use client";

import { useRef, useState, useTransition } from "react";
import { addComment } from "@/lib/actions";

export default function CommentForm({ postId }: { postId: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await addComment(postId, formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="review-form">
      {error && <p className="form-error">{error}</p>}
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="content">댓글</label>
        <textarea
          className="input"
          id="content"
          name="content"
          rows={3}
          placeholder="댓글을 남겨주세요"
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "등록 중..." : "댓글 등록"}
      </button>
    </form>
  );
}
