import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui";

/**
 * NotificationPagination
 *
 * Props:
 * - currentPage
 * - totalPages
 * - onPageChange(page)
 */

export default function NotificationPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  function pages() {
    const list = [];

    for (let i = 1; i <= totalPages; i++) {
      list.push(i);
    }

    return list;
  }

  return (
    <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-4">
      {/* Previous */}

      <Button
        size="sm"
        variant="outline"
        leftIcon={<ChevronLeft size={16} />}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      {/* Page Numbers */}

      <div className="flex items-center gap-2">
        {pages().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-all
              ${
                currentPage === page
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-border bg-surface text-ink hover:border-primary-300 hover:bg-primary-50"
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}

      <Button
        size="sm"
        variant="outline"
        rightIcon={<ChevronRight size={16} />}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}