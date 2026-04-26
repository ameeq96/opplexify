import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

function pageHref(page: number) {
  return page === 1 ? "/portfolio" : `/portfolio?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row" aria-label="Portfolio pagination">
      <p className="text-sm font-semibold text-muted">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={pageHref(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          className={`grid size-10 place-items-center rounded-md border border-[var(--line)] transition ${
            currentPage === 1 ? "pointer-events-none text-muted/45" : "hover:border-cobalt hover:text-cobalt dark:hover:border-neon dark:hover:text-neon"
          }`}
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </Link>

        {visiblePages.map((page, index) => {
          const previous = visiblePages[index - 1];
          const showGap = previous && page - previous > 1;

          return (
            <span key={page} className="flex items-center gap-2">
              {showGap && <span className="px-1 text-sm font-bold text-muted">...</span>}
              <Link
                href={pageHref(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-md border text-sm font-bold transition ${
                  page === currentPage
                    ? "border-cobalt bg-cobalt text-white dark:border-neon dark:bg-neon dark:text-ink"
                    : "border-[var(--line)] hover:border-cobalt hover:text-cobalt dark:hover:border-neon dark:hover:text-neon"
                }`}
              >
                {page}
              </Link>
            </span>
          );
        })}

        <Link
          href={pageHref(Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage === totalPages}
          className={`grid size-10 place-items-center rounded-md border border-[var(--line)] transition ${
            currentPage === totalPages ? "pointer-events-none text-muted/45" : "hover:border-cobalt hover:text-cobalt dark:hover:border-neon dark:hover:text-neon"
          }`}
          title="Next page"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </nav>
  );
}
