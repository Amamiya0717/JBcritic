import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import type { Post, Profile } from "@/lib/types";

type PostRow = Post & {
  profiles: Pick<Profile, "nickname"> | null;
  comments: { id: string }[];
};

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(nickname), comments(id)")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as PostRow[];

  return (
    <>
      <Header />
      <div className="page">
        <Link href="/" className="back-link btn-text">
          ← 홈으로
        </Link>
        <div className="spotlight-header">
          <h2 className="spotlight-title">게시판</h2>
          <Link href="/board/new" className="btn btn-gold">
            글쓰기
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <p>아직 등록된 게시글이 없어요. 첫 글을 남겨보세요.</p>
          </div>
        ) : (
          <div>
            {list.map((p) => (
              <Link key={p.id} href={`/board/${p.id}`} className="review-item review-item-link">
                <div className="review-body">
                  <div className="review-top">
                    <span className="review-member">{p.title}</span>
                    <span className="review-date">{fmtDate(p.created_at)}</span>
                  </div>
                  <p className="review-comment my-review-excerpt">{p.content}</p>
                  <span className="meta-text">
                    {p.profiles?.nickname ?? "탈퇴한 유저"} · 댓글 {p.comments.length}건
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
