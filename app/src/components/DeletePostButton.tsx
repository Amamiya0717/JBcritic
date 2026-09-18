"use client";

import { useTransition } from "react";
import { deletePost } from "@/lib/actions";

export default function DeletePostButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 게시글을 삭제할까요? 댓글도 모두 함께 삭제돼요.")) return;
    startTransition(() => {
      deletePost(postId);
    });
  }

  return (
    <button
      type="button"
      className="review-del"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}
