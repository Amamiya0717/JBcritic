"use client";

import { useState, useTransition } from "react";
import { createPost, updatePost } from "@/lib/actions";
import { POST_CONTENT_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "@/lib/types";

export default function PostForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: { title: string; content: string };
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = postId
        ? await updatePost(postId, formData)
        : await createPost(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="add-form">
      {error && <p className="form-error">{error}</p>}

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="title">제목</label>
        <input
          className="input"
          id="title"
          name="title"
          type="text"
          placeholder="제목을 입력하세요"
          maxLength={POST_TITLE_MAX_LENGTH}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="char-count">
          {title.length}/{POST_TITLE_MAX_LENGTH}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 20 }}>
        <label htmlFor="content">내용</label>
        <textarea
          className="input review-textarea"
          id="content"
          name="content"
          rows={8}
          placeholder="내용을 입력하세요"
          maxLength={POST_CONTENT_MAX_LENGTH}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="char-count">
          {content.length}/{POST_CONTENT_MAX_LENGTH}
        </div>
      </div>

      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "저장 중..." : postId ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
