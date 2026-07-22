import { useMemo, useState } from "react";
import { DEFAULT_SORT, SORT_DIRECTIONS } from "../constants";

/**
 * Generic sorting hook.
 *
 * Supports:
 * - String sorting
 * - Number sorting
 * - Date sorting
 * - Boolean sorting
 * - Nested fields (owner.name)
 * - Custom sort function per column
 */

function getNestedValue(obj, path) {
  if (!path) return null;

  return path.split(".").reduce((value, key) => {
    return value?.[key];
  }, obj);
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  // Number
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  // Boolean
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }

  // Date
  const dateA = new Date(a);
  const dateB = new Date(b);

  if (!Number.isNaN(dateA.getTime()) && !Number.isNaN(dateB.getTime())) {
    return dateA.getTime() - dateB.getTime();
  }

  // String
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function useSorting(rows = [], columns = []) {
  const [sortModel, setSortModel] = useState(DEFAULT_SORT);

  function handleSort(field) {
    const column = columns.find((c) => c.field === field);

    if (!column || column.sortable === false) {
      return;
    }

    setSortModel((previous) => {
      if (previous.field !== field) {
        return {
          field,
          direction: SORT_DIRECTIONS.ASC,
        };
      }

      return {
        field,
        direction:
          previous.direction === SORT_DIRECTIONS.ASC
            ? SORT_DIRECTIONS.DESC
            : SORT_DIRECTIONS.ASC,
      };
    });
  }

  const sortedRows = useMemo(() => {
    if (!sortModel.field) {
      return rows;
    }

    const column = columns.find(
      (c) => c.field === sortModel.field
    );

    const sorted = [...rows].sort((rowA, rowB) => {
      // Custom sorting

      if (column?.sortComparator) {
        return column.sortComparator(rowA, rowB);
      }

      const valueA = getNestedValue(rowA, sortModel.field);
      const valueB = getNestedValue(rowB, sortModel.field);

      return compareValues(valueA, valueB);
    });

    if (sortModel.direction === SORT_DIRECTIONS.DESC) {
      sorted.reverse();
    }

    return sorted;
  }, [rows, sortModel, columns]);

  return {
    sortedRows,
    sortModel,
    handleSort,
    setSortModel,
  };
}