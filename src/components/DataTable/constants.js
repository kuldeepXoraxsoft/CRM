// ============================================================================
// DataTable Constants
// ============================================================================

export const PAGE_SIZES = [10, 25, 50, 100]

export const DEFAULT_PAGE_SIZE = 10

export const DEFAULT_SORT = {
  field: null,
  direction: "asc",
}

export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
}

export const FILTER_OPERATORS = {
  CONTAINS: "contains",
  EQUALS: "equals",
  STARTS_WITH: "startsWith",
  ENDS_WITH: "endsWith",
  GREATER_THAN: "greaterThan",
  LESS_THAN: "lessThan",
  BETWEEN: "between",
  IN: "in",
}

export const ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
}

export const DENSITY = {
  COMPACT: "compact",
  STANDARD: "standard",
  COMFORTABLE: "comfortable",
}

export const DEFAULT_DENSITY = DENSITY.STANDARD

export const TOOLBAR_DEFAULTS = {
  search: true,
  filters: true,
  columnVisibility: true,
  export: true,
  refresh: true,
  density: true,
}

export const DEFAULT_COLUMN = {
  width: 180,
  minWidth: 120,
  sortable: true,
  searchable: true,
  filterable: true,
  hideable: true,
  align: ALIGNMENTS.LEFT,
}

export const ROW_HEIGHT = {
  compact: 40,
  standard: 52,
  comfortable: 64,
}

export const TABLE_MESSAGES = {
  NO_ROWS: "No records found.",
  NO_RESULTS: "No matching records.",
  LOADING: "Loading...",
}

export const CSV_EXPORT_NAME = "export"

export const DATE_FORMAT = "DD MMM YYYY"

export const ACTION_COLUMN_WIDTH = 80

export const SELECTION_COLUMN_WIDTH = 56