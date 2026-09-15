import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import { createClient } from "@/lib/supabase/server";
import { withStats, type Game } from "@/lib/types";

export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const qRaw = searchParams.q;
  const initialSearch = typeof qRaw === "string" ? qRaw : "";

  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("*, reviews(score)")
    .order("created_at", { ascending: false });

  const list = ((games ?? []) as (Game & { reviews: { score: number }[] })[]).map(
    (g) => {
      const { reviews, ...game } = g;
      return withStats(game, reviews);
    }
  );

  return (
    <>
      <Header />
      <GameListClient games={list} initialSearch={initialSearch} />
    </>
  );
}
