import { useEffect, useMemo, useState } from "react";
import { Search, Inbox, X } from "lucide-react";

import Pagination from "./Pagination";

import "./datatable.css";

export default function DataTable({
  columns,
  data,
  keyField = "id",

  searchable = false,
  searchPlaceholder = "Search...",

  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,

  onRowClick,
  renderActions,

  emptyTitle = "No Data",
  emptyMessage = "There is nothing to show here yet.",

  bodyHeight,

  // Server-side mode
  serverPagination = false,
  totalItems = 0,
  currentPage: externalPage,
  onPageChange: externalOnPageChange,
  onSearchChange: externalOnSearchChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const currentPage =
    serverPagination && externalPage !== undefined
      ? externalPage
      : internalPage;

  /*
   * CLIENT-SIDE SEARCH
   *
   * Only used when serverPagination=false.
   */
  const filteredData = useMemo(() => {
    if (serverPagination) return data;

    if (!searchable || !searchTerm.trim()) {
      return data;
    }

    const term = searchTerm.trim().toLowerCase();

    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];

        if (value === null || value === undefined) {
          return false;
        }

        return String(value)
          .toLowerCase()
          .includes(term);
      })
    );
  }, [
    data,
    columns,
    searchTerm,
    searchable,
    serverPagination,
  ]);

  /*
   * TOTAL ITEMS
   */
  const itemCount = serverPagination
    ? totalItems
    : filteredData.length;

  /*
   * TOTAL PAGES
   */
  const totalPages = Math.max(
    1,
    Math.ceil(itemCount / pageSize)
  );

  /*
   * Make sure current page is valid.
   */
  const safePage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  /*
   * CLIENT-SIDE PAGINATION
   *
   * Server mode receives already-paginated data,
   * so don't slice it again.
   */
  const paginatedData = useMemo(() => {
    if (serverPagination) {
      return data;
    }

    const start = (safePage - 1) * pageSize;

    return filteredData.slice(
      start,
      start + pageSize
    );
  }, [
    serverPagination,
    data,
    filteredData,
    safePage,
    pageSize,
  ]);

  /*
   * Reset page when normal client-side
   * filtering changes.
   */
  useEffect(() => {
    if (!serverPagination) {
      setInternalPage(1);
    }
  }, [searchTerm, serverPagination]);

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearchTerm(value);

    if (serverPagination) {
      externalOnSearchChange?.(value);
    } else {
      setInternalPage(1);
    }
  }

  function handlePageChange(page) {
    if (serverPagination) {
      externalOnPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize);

    if (serverPagination) {
      externalOnPageChange?.(1);
    } else {
      setInternalPage(1);
    }
  }

  const displayData = serverPagination
    ? data
    : paginatedData;

  return (
    <div className="data-table-wrapper">

      {searchable && (
        <div className="data-table-search">
          <Search
            size={16}
            className="data-table-search-icon"
          />

          <input
            type="text"
            className="data-table-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {searchTerm && (
            <button
              type="button"
              className="data-table-search-clear"
              onClick={() => {
                setSearchTerm("");

                if (serverPagination) {
                  externalOnSearchChange?.("");
                } else {
                  setInternalPage(1);
                }
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      <div
        className="data-table-scroll"
        style={
          bodyHeight
            ? {
                height: bodyHeight,
                overflowY: "auto",
              }
            : undefined
        }
      >
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={
                    col.width
                      ? { width: col.width }
                      : undefined
                  }
                >
                  {col.label}
                </th>
              ))}

              {renderActions && (
                <th className="data-table-actions-col">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (renderActions ? 1 : 0)
                  }
                  className="data-table-empty-cell"
                >
                  <div className="data-table-empty-state">
                    <Inbox
                      size={36}
                      className="text-ink-faint"
                    />

                    <h3>{emptyTitle}</h3>

                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((row) => (
                <tr
                  key={row[keyField]}
                  className={
                    onRowClick
                      ? "data-table-row-clickable"
                      : ""
                  }
                  onClick={
                    onRowClick
                      ? () => onRowClick(row)
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row)
                        : row[col.key] ?? "-"}
                    </td>
                  ))}

                  {renderActions && (
                    <td
                      className="data-table-actions-cell"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {itemCount > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={itemCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={
            showPageSizeSelector
              ? handlePageSizeChange
              : undefined
          }
        />
      )}
    </div>
  );
}