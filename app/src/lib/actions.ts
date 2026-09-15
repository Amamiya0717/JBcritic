"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const score = Math.round(parseFloat(scoreRaw) * 10) / 10;

  if (scoreRaw === "" || isNaN(score) || score < 0 || score > 10) {
    return { error: "점수는 0에서 10 사이로 입력해주세요." };
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
