import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Table Header
 * ============================================================================
 *
 * Features
 * --------
 * ✓ Sticky Header
 * ✓ Sorting
 * ✓ Select All
 * ✓ Indeterminate Checkbox
 * ✓ Custom Header Renderer
 */

export default function TableHeader() {
  const {
    visibleColumns,
    displayRows,
    selectable,
    sortable,

    sorting,
    selection,
  } = useTable();

  const {
    sortModel,
    handleSort,
  } = sorting;

  const {
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
  } = selection;

  return (
    <thead className="datatable-thead">

      <tr>

        {selectable && (
          <th className="datatable-th checkbox-column">

            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isIndeterminate;
                }
              }}
              onChange={toggleSelectAll}
            />

          </th>
        )}

        {visibleColumns.map((column) => {

          const active =
            sortModel.field === column.field;

          const direction =
            sortModel.direction;

          return (

            <th
              key={column.field}
              className={`datatable-th align-${column.align || "left"}`}
              style={{
                width: column.width,
                minWidth: column.minWidth,
              }}
            >

              <div
                className={`datatable-header-cell ${
                  column.sortable !== false &&
                  sortable
                    ? "sortable"
                    : ""
                }`}
                onClick={() => {
                  if (
                    sortable &&
                    column.sortable !== false
                  ) {
                    handleSort(column.field);
                  }
                }}
              >

                {column.renderHeader ? (
                  column.renderHeader(column)
                ) : (
                  <span>
                    {column.headerName ??
                      column.field}
                  </span>
                )}

                {sortable &&
                  column.sortable !== false && (

                  <span className="datatable-sort-icon">

                    {!active && (
                      <ArrowUpDown size={15} />
                    )}

                    {active &&
                      direction === "asc" && (
                        <ArrowUp size={15} />
                      )}

                    {active &&
                      direction === "desc" && (
                        <ArrowDown size={15} />
                      )}

                  </span>

                )}

              </div>

            </th>

          );

        })}

      </tr>

    </thead>
  );
}