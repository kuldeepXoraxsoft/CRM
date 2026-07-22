import { useMemo, useState } from "react";

/**
 * Generic Row Selection Hook
 *
 * Features
 * --------
 * ✓ Single row selection
 * ✓ Multi row selection
 * ✓ Select all
 * ✓ Clear selection
 * ✓ Indeterminate state
 * ✓ Shift-click range selection
 */

export default function useSelection(rows = [], getRowId = (row) => row.id) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------

  const rowIds = useMemo(
    () => rows.map(getRowId),
    [rows, getRowId]
  );

  const selectedCount = selectedRows.length;

  const isAllSelected =
    rowIds.length > 0 &&
    rowIds.every((id) => selectedRows.includes(id));

  const isIndeterminate =
    selectedCount > 0 && !isAllSelected;

  // -------------------------------------------------
  // Row Selection
  // -------------------------------------------------

  function toggleRow(row, options = {}) {
    const id = getRowId(row);

    const currentIndex = rows.findIndex(
      (r) => getRowId(r) === id
    );

    // ---------------------------------------------
    // Shift Selection
    // ---------------------------------------------

    if (
      options.shiftKey &&
      lastSelectedIndex !== null
    ) {
      const start = Math.min(
        lastSelectedIndex,
        currentIndex
      );

      const end = Math.max(
        lastSelectedIndex,
        currentIndex
      );

      const ids = rows
        .slice(start, end + 1)
        .map(getRowId);

      setSelectedRows((previous) => {
        return [...new Set([...previous, ...ids])];
      });

      return;
    }

    setLastSelectedIndex(currentIndex);

    setSelectedRows((previous) => {
      if (previous.includes(id)) {
        return previous.filter((value) => value !== id);
      }

      return [...previous, id];
    });
  }

  // -------------------------------------------------
  // Select All
  // -------------------------------------------------

  function selectAll() {
    setSelectedRows(rowIds);
  }

  function clearSelection() {
    setSelectedRows([]);
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      clearSelection();
      return;
    }

    selectAll();
  }

  // -------------------------------------------------
  // Utilities
  // -------------------------------------------------

  function isSelected(id) {
    return selectedRows.includes(id);
  }

  function removeSelection(id) {
    setSelectedRows((previous) =>
      previous.filter((value) => value !== id)
    );
  }

  function setSelection(ids = []) {
    setSelectedRows(ids);
  }

  return {
    selectedRows,
    selectedCount,

    isSelected,

    isAllSelected,
    isIndeterminate,

    toggleRow,
    toggleSelectAll,

    selectAll,
    clearSelection,

    removeSelection,
    setSelection,
  };
}