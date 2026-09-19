import CategoryListPage from "@/components/CategoryListPage";

export default async function GamesPage(props: PageProps<"/games">) {
  const searchParams = await props.searchParams;
  return <CategoryListPage category="game" searchParams={searchParams} />;
}
