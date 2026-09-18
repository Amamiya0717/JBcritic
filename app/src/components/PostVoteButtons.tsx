"use client";

import { useTransition } from "react";
import { votePost } from "@/lib/actions";

export default function PostVoteButtons({
  postId,
  upvotes,
  downvotes,
  myVote,
  loggedIn,
}: {
  postId: string;
  upvotes: number;
  downvotes: number;
  myVote: 1 | -1 | null;
  loggedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleVote(value: 1 | -1) {
    if (!loggedIn) return;
    startTransition(() => {
      votePost(postId, value);
    });
  }

  return (
    <div className="vote-row">
      <button
        type="button"
        className={`vote-btn up${myVote === 1 ? " active" : ""}`}
        disabled={pending || !loggedIn}
        onClick={() => handleVote(1)}
      >
        추천 {upvotes}
      </button>
      <button
        type="button"
        className={`vote-btn down${myVote === -1 ? " active" : ""}`}
        disabled={pending || !loggedIn}
        onClick={() => handleVote(-1)}
      >
        비추천 {downvotes}
      </button>
    </div>
  );
}
