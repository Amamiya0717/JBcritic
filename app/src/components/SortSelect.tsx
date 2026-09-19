"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, type SortKey } from "@/lib/types";

export default function SortSelect({
  basePath,
  sort,
}: {
  basePath: string;
  sort: SortKey;
}) {
  const router = useRouter();

  return (
    <select
      className="select"
      value={sort}
      onChange={(e) => router.push(`${basePath}?sort=${e.target.value}&page=1`)}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
