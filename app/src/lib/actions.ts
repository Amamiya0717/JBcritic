"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POST_CONTENT_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "@/lib/types";

export type ActionResult = { error: string } | { error: null };

export async function addGame(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const title = String(formData.get("title") || "").trim();
  const genre = String(formData.get("genre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const color = String(formData.get("color") || "#66cc33");

  if (!title) return { error: "게임 제목을 입력해주세요." };

  const { data, error } = await supabase
    .from("games")
    .insert({
      title,
      genre: genre || null,
      description: description || null,
      cover_url: coverUrl || null,
      color,
      added_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: "게임 저장에 실패했어요: " + error.message };

  revalidatePath("/");
  redirect(`/games/${data.id}`);
}

export async function updateGame(
  gameId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const title = String(formData.get("title") || "").trim();
  const genre = String(formData.get("genre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const color = String(formData.get("color") || "#66cc33");

  if (!title) return { error: "게임 제목을 입력해주세요." };

  const { error } = await supabase
    .from("games")
    .update({
      title,
      genre: genre || null,
      description: description || null,
      cover_url: coverUrl || null,
      color,
    })
    .eq("id", gameId)
    .eq("added_by", user.id);

  if (error) return { error: "게임 수정에 실패했어요: " + error.message };

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/");
  redirect(`/games/${gameId}`);
}

export async function deleteGame(gameId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", gameId)
    .eq("added_by", user.id);

  if (error) return { error: "삭제에 실패했어요: " + error.message };

  revalidatePath("/");
  redirect("/");
}

export async function submitReview(
  gameId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const scoreRaw = String(formData.get("score") || "");
  const comment = String(formData.get("comment") || "").trim();
  const score = Math.round(parseFloat(scoreRaw));

  if (scoreRaw === "" || isNaN(score) || score < 0 || score > 100) {
    return { error: "점수는 0에서 100 사이로 입력해주세요." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      game_id: gameId,
      user_id: user.id,
      score,
      comment: comment || null,
    },
    { onConflict: "game_id,user_id" }
  );

  if (error) return { error: "평가 저장에 실패했어요: " + error.message };

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/");
  return { error: null };
}

export async function deleteReview(
  gameId: string,
  reviewId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) return { error: "삭제에 실패했어요: " + error.message };

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/");
  return { error: null };
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) return { error: "제목을 입력해주세요." };
  if (title.length > POST_TITLE_MAX_LENGTH)
    return { error: `제목은 ${POST_TITLE_MAX_LENGTH}자 이내로 입력해주세요.` };
  if (!content) return { error: "내용을 입력해주세요." };
  if (content.length > POST_CONTENT_MAX_LENGTH)
    return { error: `내용은 ${POST_CONTENT_MAX_LENGTH}자 이내로 입력해주세요.` };

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();

  if (error) return { error: "게시글 저장에 실패했어요: " + error.message };

  revalidatePath("/");
  revalidatePath("/board");
  redirect(`/board/${data.id}`);
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) return { error: "제목을 입력해주세요." };
  if (title.length > POST_TITLE_MAX_LENGTH)
    return { error: `제목은 ${POST_TITLE_MAX_LENGTH}자 이내로 입력해주세요.` };
  if (!content) return { error: "내용을 입력해주세요." };
  if (content.length > POST_CONTENT_MAX_LENGTH)
    return { error: `내용은 ${POST_CONTENT_MAX_LENGTH}자 이내로 입력해주세요.` };

  const { error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) return { error: "게시글 수정에 실패했어요: " + error.message };

  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");
  revalidatePath("/");
  redirect(`/board/${postId}`);
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) return { error: "삭제에 실패했어요: " + error.message };

  revalidatePath("/board");
  revalidatePath("/");
  redirect("/board");
}

export async function addComment(
  postId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "댓글 내용을 입력해주세요." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, content });

  if (error) return { error: "댓글 저장에 실패했어요: " + error.message };

  revalidatePath(`/board/${postId}`);
  return { error: null };
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { error: "삭제에 실패했어요: " + error.message };

  revalidatePath(`/board/${postId}`);
  return { error: null };
}

export async function updateNickname(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const nickname = String(formData.get("nickname") || "").trim();
  if (!nickname) return { error: "닉네임을 입력해주세요." };
  if (nickname.length > 20) return { error: "닉네임은 20자 이내로 입력해주세요." };

  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id);

  if (error) return { error: "닉네임 변경에 실패했어요: " + error.message };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
