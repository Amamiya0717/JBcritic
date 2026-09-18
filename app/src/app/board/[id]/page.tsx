import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import DeletePostButton from "@/components/DeletePostButton";
import { createClient } from "@/lib/supabase/server";
import { fmtRecentDate } from "@/lib/format";
import type { Comment, Post, Profile } from "@/lib/types";

export default async function PostDetailPage(props: PageProps<"/board/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(nickname)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(id, nickname, created_at)")
    .eq("post_id", id);

  const commentList = (comments ?? []) as Comment[];
  const author = (post as Post & { profiles: Pick<Profile, "nickname"> | null })
    .profiles;

  return (
    <>
      <Header />
      <div className="page">
        <Link href="/board" className="back-link btn-text">
          ← 게시판으로
        </Link>

        <div className="detail-card" style={{ display: "block" }}>
          <h2 className="detail-title">{post.title}</h2>
          <div className="detail-meta">
            <span className="meta-text">{author?.nickname ?? "탈퇴한 유저"}</span>
            <span className="meta-text">{fmtRecentDate(post.created_at)} 작성</span>
          </div>
          <p className="detail-desc" style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
          {user?.id === post.author_id && (
            <div className="review-actions" style={{ marginTop: 10 }}>
              <Link href={`/board/${id}/edit`} className="review-edit">
                수정
              </Link>
              <DeletePostButton postId={id} />
            </div>
          )}
        </div>

        {user ? (
          <>
            <h3 className="section-title">댓글 남기기</h3>
            <CommentForm postId={id} />
          </>
        ) : (
          <>
            <h3 className="section-title">댓글 남기기</h3>
            <div className="empty-state" style={{ marginBottom: 24 }}>
              <p>댓글을 남기려면 로그인해주세요.</p>
              <Link href="/login" className="btn btn-gold">
                로그인
              </Link>
            </div>
          </>
        )}

        <h3 className="section-title">댓글 ({commentList.length})</h3>
        <CommentList postId={id} comments={commentList} currentUserId={user?.id ?? null} />
      </div>
    </>
  );
}
