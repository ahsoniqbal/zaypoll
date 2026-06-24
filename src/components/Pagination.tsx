import Link from "next/link";

import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";


type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
};

export default function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: PaginationProps) {

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(newPage));

    return `${basePath}?${params.toString()}`;
  };

  const createPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pages = Array.from(new Set(createPageNumbers()));

  return (
    <UIPagination className="mt-8">
      <PaginationContent>

        {/* Prev */}
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(page - 1)} />
          </PaginationItem>
        )}

        {/*Page Numbers */}
        {pages.map((p, idx) => {
            const key = `${p}-${idx}`;

            return p === "..." ? (
              <PaginationItem key={key}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={key}>
                <PaginationLink
                  href={buildUrl(p)}
                  isActive={p === page}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}


        {/* Next */}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildUrl(page + 1)} />
          </PaginationItem>
        )}

      </PaginationContent>
    </UIPagination>
  );
}
