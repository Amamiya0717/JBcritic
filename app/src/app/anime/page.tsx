import CategoryListPage from "@/components/CategoryListPage";

export default async function AnimePage(props: PageProps<"/anime">) {
  const searchParams = await props.searchParams;
  return <CategoryListPage category="anime" searchParams={searchParams} />;
}
