import Link from "next/link";
import type { SortKey } from "@/lib/types";

export default function Pagination({
  basePath,
  sort,
  page,
  totalPages,
}: {
  basePath: string;
  sort: SortKey;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => `${basePath}?sort=${sort}&page=${p}`;

  return (
    <nav className="pagination" aria-label="페이지">
      {page <= 1 ? (
        <span className="pagination-link disabled" aria-disabled>
          ‹
        </span>
      ) : (
        <Link href={hrefFor(page - 1)} className="pagination-link">
          ‹
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
        p === page ? (
          <span key={p} className="pagination-link active" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className="pagination-link">
            {p}
          </Link>
        )
      )}
      {page >= totalPages ? (
        <span className="pagination-link disabled" aria-disabled>
          ›
        </span>
      ) : (
        <Link href={hrefFor(page + 1)} className="pagination-link">
          ›
        </Link>
      )}
    </nav>
  );
}
