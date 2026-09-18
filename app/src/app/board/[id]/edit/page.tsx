import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditPostPage(props: PageProps<"/board/[id]/edit">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();
  if (!user || user.id !== post.author_id) redirect(`/board/${id}`);

  return (
    <>
      <Header />
      <div className="page">
        <Link href={`/board/${id}`} className="back-link btn-text">
          ← 게시글로
        </Link>
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          게시글 수정
        </h2>
        <PostForm postId={id} initial={{ title: post.title, content: post.content }} />
      </div>
    </>
  );
}
