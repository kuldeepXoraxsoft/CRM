import { createContext, useContext } from "react";

/**
 * ============================================================================
 * Table Context
 * ============================================================================
 *
 * Shared state for the entire DataTable.
 *
 * Every component (Header, Body, Toolbar, Pagination, etc.)
 * can access the table state without prop drilling.
 */

export const TableContext = createContext(null);

/**
 * Custom Hook
 */

export function useTable() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error(
      "useTable must be used inside <DataTable />"
    );
  }

  return context;
}