"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtRecentDate } from "@/lib/format";
import type { Post, Profile } from "@/lib/types";

export type RecentPostRow = Post & {
  profiles: Pick<Profile, "nickname"> | null;
  commentCount: number;
};

const PAGE_SIZE = 5;

export default function RecentPostsList({ posts }: { posts: RecentPostRow[] }) {
  const [showAll, setShowAll] = useState(false);

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>아직 등록된 게시글이 없어요. 첫 글을 남겨보세요.</p>
        <Link href="/board/new" className="btn btn-gold">
          글쓰기
        </Link>
      </div>
    );
  }

  const visible = showAll ? posts : posts.slice(0, PAGE_SIZE);

  return (
    <div>
      {visible.map((p) => (
        <Link key={p.id} href={`/board/${p.id}`} className="review-item review-item-link">
          <div className="review-body">
            <div className="review-top">
              <span className="review-member">
                {p.title} <span className="meta-text">[{p.commentCount}]</span>
              </span>
              <span className="review-date">{fmtRecentDate(p.created_at)}</span>
            </div>
            <span className="meta-text">{p.profiles?.nickname ?? "탈퇴한 유저"}</span>
          </div>
        </Link>
      ))}
      {!showAll && posts.length > PAGE_SIZE && (
        <div className="load-more">
          <button type="button" className="btn" onClick={() => setShowAll(true)}>
            더보기 ({posts.length})
          </button>
        </div>
      )}
    </div>
  );
}
