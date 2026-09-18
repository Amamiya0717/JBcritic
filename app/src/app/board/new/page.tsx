import Link from "next/link";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <div className="page">
        <Link href="/board" className="back-link btn-text">
          ← 게시판으로
        </Link>
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          새 글 작성
        </h2>
        {user ? (
          <PostForm />
        ) : (
          <div className="empty-state">
            <p>글을 작성하려면 로그인해주세요.</p>
            <Link href="/login" className="btn btn-gold">
              로그인
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
