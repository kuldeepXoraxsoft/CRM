import { useMemo, useState } from "react";
import { Search, Inbox, X } from "lucide-react";

import Pagination from "./Pagination";

import "./datatable.css";

/**
 * Generic reusable table component.
 *
 * Usage:
 * <DataTable
 *   columns={[
 *     { key: "customerName", label: "Customer Name" },
 *     { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
 *   ]}
 *   data={leads}
 *   keyField="id"
 *   searchable
 *   searchPlaceholder="Search leads..."
 *   pageSize={10}
 *   onRowClick={(row) => openLead(row)}
 *   renderActions={(row) => (
 *     <>
 *       <button onClick={() => onEdit(row)}>Edit</button>
 *       <button onClick={() => onDelete(row.id)}>Delete</button>
 *     </>
 *   )}
 *   emptyTitle="No Leads"
 *   emptyMessage='Click "Add Lead" to create your first lead.'
 * />
 */
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
  bodyHeight, // e.g. "60vh", "420px", "100%" - table rows become a fixed-height
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data;

    const term = searchTerm.trim().toLowerCase();

    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [data, columns, searchTerm, searchable]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage, pageSize]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  return (
    <div className="data-table-wrapper">
      {searchable && (
        <div className="data-table-search">
          <Search size={16} className="data-table-search-icon" />

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
                setCurrentPage(1);
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
        style={bodyHeight ? { height: bodyHeight, overflowY: "auto" } : undefined}
      >
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
              {renderActions && <th className="data-table-actions-col">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="data-table-empty-cell"
                >
                  <div className="data-table-empty-state">
                    <Inbox size={36} className="text-ink-faint" />
                    <h3>{emptyTitle}</h3>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row[keyField]}
                  className={onRowClick ? "data-table-row-clickable" : ""}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? "-"}
                    </td>
                  ))}

                  {renderActions && (
                    <td
                      className="data-table-actions-cell"
                      onClick={(e) => e.stopPropagation()}
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

      {filteredData.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={showPageSizeSelector ? handlePageSizeChange : undefined}
        />
      )}
    </div>
  );
}