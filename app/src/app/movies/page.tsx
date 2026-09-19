import CategoryListPage from "@/components/CategoryListPage";

export default async function MoviesPage(props: PageProps<"/movies">) {
  const searchParams = await props.searchParams;
  return <CategoryListPage category="movies" searchParams={searchParams} />;
}
