import { useMemo, useState } from "react";

/**
 * useColumnVisibility
 *
 * Handles:
 * ✓ Show / Hide columns
 * ✓ Hideable columns
 * ✓ Reset columns
 * ✓ Toggle all columns
 * ✓ Future Redux/LocalStorage support
 */

export default function useColumnVisibility(columns = []) {
  /**
   * Initial visibility map
   *
   * {
   *   name: true,
   *   company: true,
   *   phone: false
   * }
   */
  const initialVisibility = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.field] = column.hidden !== true;
      return acc;
    }, {});
  }, [columns]);

  const [visibilityModel, setVisibilityModel] =
    useState(initialVisibility);

  /**
   * Visible columns
   */
  const visibleColumns = useMemo(() => {
    return columns.filter(
      (column) => visibilityModel[column.field] !== false
    );
  }, [columns, visibilityModel]);

  /**
   * Toggle one column
   */
  function toggleColumn(field) {
    const column = columns.find(
      (c) => c.field === field
    );

    if (!column) return;

    // Locked column
    if (column.hideable === false) return;

    setVisibilityModel((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  /**
   * Show one column
   */
  function showColumn(field) {
    setVisibilityModel((prev) => ({
      ...prev,
      [field]: true,
    }));
  }

  /**
   * Hide one column
   */
  function hideColumn(field) {
    const column = columns.find(
      (c) => c.field === field
    );

    if (!column || column.hideable === false) return;

    setVisibilityModel((prev) => ({
      ...prev,
      [field]: false,
    }));
  }

  /**
   * Show every hideable column
   */
  function showAllColumns() {
    const model = {};

    columns.forEach((column) => {
      model[column.field] = true;
    });

    setVisibilityModel(model);
  }

  /**
   * Hide every hideable column
   */
  function hideAllColumns() {
    const model = {};

    columns.forEach((column) => {
      model[column.field] =
        column.hideable === false;
    });

    setVisibilityModel(model);
  }

  /**
   * Restore defaults
   */
  function resetColumns() {
    setVisibilityModel(initialVisibility);
  }

  return {
    visibleColumns,

    visibilityModel,

    toggleColumn,

    showColumn,

    hideColumn,

    showAllColumns,

    hideAllColumns,

    resetColumns,

    setVisibilityModel,
  };
}