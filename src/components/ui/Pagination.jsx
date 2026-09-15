import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import "./pagination.css";

/**
 * Reusable pagination footer. Works with any list — pass total counts and
 * a couple of callbacks, it handles page-number buttons, ellipsis, and an
 * optional "rows per page" dropdown.
 *
 * Usage:
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   totalItems={filteredData.length}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}        // optional - omit to hide the dropdown
 *   pageSizeOptions={[10, 25, 50, 100]}   // optional
 * />
 */
function getPageNumbers(currentPage, totalPages) {
  const maxButtons = 5;

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("...");

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
}) {
  if (!totalItems) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="pagination-footer">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong>-<strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong>

        {onPageSizeChange && (
          <select
            className="pagination-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First page"
          >
            <ChevronsLeft size={15} />
          </button>

          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                &hellip;
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-btn pagination-page-btn ${
                  page === currentPage ? "pagination-page-btn-active" : ""
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next page"
          >
            <ChevronRight size={15} />
          </button>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
