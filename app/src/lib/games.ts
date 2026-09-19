import { createClient } from "@/lib/supabase/server";
import { withStats, type Game, type GameCategory, type GameWithStats } from "@/lib/types";

export type GameWithScores = {
  stats: GameWithStats;
  scores: number[];
};

export async function fetchGamesWithScoresByCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: GameCategory
): Promise<GameWithScores[]> {
  const { data } = await supabase
    .from("games")
    .select("*, reviews(score)")
    .eq("category", category)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as (Game & { reviews: { score: number }[] })[];
  return rows.map((g) => {
    const { reviews, ...game } = g;
    return { stats: withStats(game, reviews), scores: reviews.map((r) => r.score) };
  });
}

export async function fetchGamesByCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: GameCategory
): Promise<GameWithStats[]> {
  const rows = await fetchGamesWithScoresByCategory(supabase, category);
  return rows.map((r) => r.stats);
}
