"use client";

import { useTransition } from "react";
import { deleteGame } from "@/lib/actions";
import type { GameCategory } from "@/lib/types";

export default function DeleteGameButton({
  gameId,
  category,
}: {
  gameId: string;
  category: GameCategory;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 게임을 삭제할까요? 등록된 리뷰도 모두 함께 삭제돼요.")) return;
    startTransition(() => {
      deleteGame(gameId, category);
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
