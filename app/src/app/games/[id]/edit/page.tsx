import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import AddGameForm from "@/components/AddGameForm";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export default async function EditGamePage(props: PageProps<"/games/[id]/edit">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (!game) notFound();
  if (!user || (user.id !== game.added_by && !(await isAdmin(supabase)))) {
    redirect(`/games/${id}`);
  }

  return (
    <>
      <Header />
      <div className="page">
        <Link href={`/games/${id}`} className="back-link btn-text">
          ← 작품으로
        </Link>
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          작품 정보 수정
        </h2>
        <AddGameForm
          gameId={id}
          initial={{
            title: game.title,
            genre: game.genre,
            description: game.description,
            coverUrl: game.cover_url,
            color: game.color,
            category: game.category,
            studio: game.studio,
            director: game.director,
            artist: game.artist,
            release_year: game.release_year,
            venue: game.venue,
            event_date: game.event_date,
          }}
        />
      </div>
    </>
  );
}
