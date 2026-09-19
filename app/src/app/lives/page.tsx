import CategoryListPage from "@/components/CategoryListPage";

export default async function LivesPage(props: PageProps<"/lives">) {
  const searchParams = await props.searchParams;
  return <CategoryListPage category="lives" searchParams={searchParams} />;
}
