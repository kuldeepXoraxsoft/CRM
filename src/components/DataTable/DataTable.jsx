import { TableContext } from "./context/TableContext";

import useSorting from "./hooks/useSorting";
import useFiltering from "./hooks/useFiltering";
import usePagination from "./hooks/usePagination";
import useSelection from "./hooks/useSelection";
import useColumnVisibility from "./hooks/useColoumnVisibility";

import TableToolbar from "./components/TableToolbar";
import TableHeader from "./components/TableHeader";
import TableBody from "./components/TableBody";
import TablePagination from "./components/TablePagination";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";

import "./dataTable.css";

/**
 * =============================================================================
 * DataTable
 * =============================================================================
 *
 * Generic Enterprise Data Table
 *
 * Supports:
 *
 * ✓ Sorting
 * ✓ Global Search
 * ✓ Column Search
 * ✓ Filters
 * ✓ Row Selection
 * ✓ Pagination
 * ✓ Column Visibility
 * ✓ Custom Cell Rendering
 * ✓ Row Actions
 * ✓ Loading State
 * ✓ Empty State
 *
 */

export default function DataTable({
  columns = [],
  rows = [],

  loading = false,

  pageSize,

  searchable = true,
  selectable = false,
  sortable = true,
  filterable = true,
  pagination = true,
  columnVisibility = true,

  toolbar = true,

  getRowId = (row) => row.id,

  onRowClick,
  onSelectionChange,
}) {

  // ===========================================================================
  // Hooks
  // ===========================================================================

  const filtering = useFiltering(rows, columns);

  const sorting = useSorting(
    filtering.filteredRows,
    columns
  );

  const visibility = useColumnVisibility(columns);

  const paginationHook = usePagination(
    sorting.sortedRows,
    pageSize
  );

  const selection = useSelection(
    paginationHook.paginatedRows,
    getRowId
  );

  // ===========================================================================
  // Notify parent
  // ===========================================================================

  function handleSelectionChange() {
    onSelectionChange?.(selection.selectedRows);
  }

  // ===========================================================================
  // Context
  // ===========================================================================

  const value = {

    columns,

    visibleColumns: visibility.visibleColumns,

    rows,

    displayRows: pagination
      ? paginationHook.paginatedRows
      : sorting.sortedRows,

    loading,

    searchable,
    selectable,
    sortable,
    filterable,
    columnVisibility,

    filtering,

    sorting,

    paginationHook,

    selection,

    visibility,

    onRowClick,

    getRowId,

    handleSelectionChange,
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (

    <TableContext.Provider value={value}>

      <div className="datatable">

        {toolbar && (
          <TableToolbar />
        )}

        <div className="datatable-container">

          <table className="datatable-table">

            <TableHeader />

            {loading ? (
              <LoadingState />
            ) : sorting.sortedRows.length === 0 ? (
              <EmptyState />
            ) : (
              <TableBody />
            )}

          </table>

        </div>

        {pagination && (
          <TablePagination />
        )}

      </div>

    </TableContext.Provider>

  );

}