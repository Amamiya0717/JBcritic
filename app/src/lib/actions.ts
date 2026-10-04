"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import {
  CATEGORY_FIELD_KEYS,
  CATEGORY_FIELDS,
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  categoryPath,
  isGameCategory,
  type CategoryFieldKey,
  type GameCategory,
} from "@/lib/types";

export type ActionResult = { error: string } | { error: null };

function readCategoryFields(
  category: GameCategory,
  formData: FormData
): Record<CategoryFieldKey, string | number | null> {
  const result: Record<CategoryFieldKey, string | number | null> = Object.fromEntries(
    CATEGORY_FIELD_KEYS.map((key) => [key, null])
  ) as Record<CategoryFieldKey, string | number | null>;

  for (const field of CATEGORY_FIELDS[category]) {
    const raw = String(formData.get(field.key) || "").trim();
    if (!raw) continue;
    if (field.type === "year") {
      const year = parseInt(raw, 10);
      result[field.key] = Number.isFinite(year) ? year : null;
    } else {
      result[field.key] = raw;
    }
  }
  return result;
}

export async function addGame(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const categoryRaw = String(formData.get("category") || "");
  const category: GameCategory = isGameCategory(categoryRaw) ? categoryRaw : "game";
  const title = String(formData.get("title") || "").trim();
  const genre = String(formData.get("genre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const color = String(formData.get("color") || "#66cc33");

  if (!title) return { error: "제목을 입력해주세요." };

  const { data, error } = await supabase
    .from("games")
    .insert({
      title,
      genre: genre || null,
      description: description || null,
      cover_url: coverUrl || null,
      color,
      category,
      ...readCategoryFields(category, formData),
      added_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: "저장에 실패했어요: " + error.message };

  revalidatePath("/", "layout");
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

  const categoryRaw = String(formData.get("category") || "");
  const category: GameCategory = isGameCategory(categoryRaw) ? categoryRaw : "game";
  const title = String(formData.get("title") || "").trim();
  const genre = String(formData.get("genre") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const color = String(formData.get("color") || "#66cc33");

  if (!title) return { error: "제목을 입력해주세요." };

  let query = supabase
    .from("games")
    .update({
      title,
      genre: genre || null,
      description: description || null,
      cover_url: coverUrl || null,
      color,
      category,
      ...readCategoryFields(category, formData),
    })
    .eq("id", gameId);
  if (!(await isAdmin(supabase))) query = query.eq("added_by", user.id);

  const { error } = await query;

  if (error) return { error: "수정에 실패했어요: " + error.message };

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/", "layout");
  redirect(`/games/${gameId}`);
}

export async function deleteGame(
  gameId: string,
  category: GameCategory
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  let query = supabase.from("games").delete().eq("id", gameId);
  if (!(await isAdmin(supabase))) query = query.eq("added_by", user.id);

  const { error } = await query;

  if (error) return { error: "삭제에 실패했어요: " + error.message };

  revalidatePath("/", "layout");
  redirect(categoryPath(category));
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

export async function votePost(
  postId: string,
  value: 1 | -1
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 이용해주세요." };

  const { data: existing } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  // 같은 버튼을 다시 누르면 추천/비추천을 취소한다.
  if (existing?.value === value) {
    const { error } = await supabase
      .from("post_votes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) return { error: "추천 취소에 실패했어요: " + error.message };
  } else {
    const { error } = await supabase
      .from("post_votes")
      .upsert(
        { post_id: postId, user_id: user.id, value },
        { onConflict: "post_id,user_id" }
      );
    if (error) return { error: "추천 처리에 실패했어요: " + error.message };
  }

  revalidatePath(`/board/${postId}`);
  return { error: null };
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
