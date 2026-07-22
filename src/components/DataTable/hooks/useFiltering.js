import { useMemo, useState } from "react";

/**
 * Generic filtering hook
 *
 * Supports:
 * ✅ Global Search
 * ✅ Column Search
 * ✅ Multi Select Filters
 * ✅ Date Range Filters
 * ✅ Custom Filters
 */

function getNestedValue(obj, path) {
  if (!path) return "";

  return path.split(".").reduce((value, key) => {
    return value?.[key];
  }, obj);
}

export default function useFiltering(rows = [], columns = []) {
  const [globalSearch, setGlobalSearch] = useState("");

  const [columnFilters, setColumnFilters] = useState({});

  const [customFilters, setCustomFilters] = useState({});

  function updateColumnFilter(field, value) {
    setColumnFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function clearColumnFilter(field) {
    setColumnFilters((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function updateCustomFilter(field, value) {
    setCustomFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function clearFilters() {
    setGlobalSearch("");
    setColumnFilters({});
    setCustomFilters({});
  }

  const filteredRows = useMemo(() => {
    let result = [...rows];

    // -------------------------
    // Global Search
    // -------------------------

    if (globalSearch.trim()) {
      const keyword = globalSearch.toLowerCase();

      result = result.filter((row) =>
        columns.some((column) => {
          if (column.searchable === false) {
            return false;
          }

          const value = getNestedValue(row, column.field);

          return String(value ?? "")
            .toLowerCase()
            .includes(keyword);
        })
      );
    }

    // -------------------------
    // Column Search
    // -------------------------

    Object.entries(columnFilters).forEach(([field, keyword]) => {
      if (!keyword) return;

      result = result.filter((row) => {
        const value = getNestedValue(row, field);

        return String(value ?? "")
          .toLowerCase()
          .includes(String(keyword).toLowerCase());
      });
    });

    // -------------------------
    // Custom Filters
    // -------------------------

    Object.entries(customFilters).forEach(([field, filterValue]) => {
      if (
        filterValue === undefined ||
        filterValue === null ||
        filterValue === ""
      ) {
        return;
      }

      result = result.filter((row) => {
        const value = getNestedValue(row, field);

        // Array filter
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value);
        }

        // Function filter
        if (typeof filterValue === "function") {
          return filterValue(value, row);
        }

        // Primitive equality
        return value === filterValue;
      });
    });

    return result;
  }, [
    rows,
    columns,
    globalSearch,
    columnFilters,
    customFilters,
  ]);

  return {
    filteredRows,

    globalSearch,
    setGlobalSearch,

    columnFilters,
    updateColumnFilter,
    clearColumnFilter,

    customFilters,
    updateCustomFilter,

    clearFilters,
  };
}