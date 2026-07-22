import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
} from "../constants";

/**
 * Generic Pagination Hook
 *
 * Features
 * --------
 * ✓ Client Side Pagination
 * ✓ Server Side Compatible
 * ✓ Auto reset after filtering
 * ✓ Auto page correction after deletion
 * ✓ Dynamic page size
 */

export default function usePagination(rows = []) {
  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const totalRows = rows.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / pageSize)
  );

  // -----------------------------------
  // Keep current page valid
  // -----------------------------------

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // -----------------------------------
  // Reset page when page size changes
  // -----------------------------------

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // -----------------------------------
  // Paginated Rows
  // -----------------------------------

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return rows.slice(start, end);
  }, [rows, page, pageSize]);

  // -----------------------------------
  // Navigation
  // -----------------------------------

  function nextPage() {
    setPage((previous) =>
      Math.min(previous + 1, totalPages)
    );
  }

  function previousPage() {
    setPage((previous) =>
      Math.max(previous - 1, 1)
    );
  }

  function goToPage(value) {
    const next = Math.min(
      Math.max(value, 1),
      totalPages
    );

    setPage(next);
  }

  // -----------------------------------
  // Page Size
  // -----------------------------------

  function changePageSize(size) {
    if (!PAGE_SIZES.includes(size)) {
      return;
    }

    setPageSize(size);
  }

  // -----------------------------------
  // Range
  // -----------------------------------

  const startRow =
    totalRows === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const endRow = Math.min(
    page * pageSize,
    totalRows
  );

  return {
    paginatedRows,

    page,
    pageSize,

    totalRows,
    totalPages,

    startRow,
    endRow,

    setPage,
    goToPage,

    nextPage,
    previousPage,

    changePageSize,
  };
}