import CategoryListPage from "@/components/CategoryListPage";

export default async function MusicPage(props: PageProps<"/music">) {
  const searchParams = await props.searchParams;
  return <CategoryListPage category="music" searchParams={searchParams} />;
}
