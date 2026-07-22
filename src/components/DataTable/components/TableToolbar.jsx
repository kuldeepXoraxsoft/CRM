import SearchBox from "./SearchBox";
import FilterDropdown from "./FilterDropdown";
import ColumnSelector from "./ColumnSelector";
import ExportButton from "./ExportButton";
import RefreshButton from "./RefreshButton";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Table Toolbar
 * ============================================================================
 *
 * Displays:
 *
 * ✓ Global Search
 * ✓ Filters
 * ✓ Column Visibility
 * ✓ Export
 * ✓ Refresh
 * ✓ Bulk Selection Toolbar
 *
 */

export default function TableToolbar() {

  const {
    searchable,
    filterable,
    columnVisibility,

    selection,

  } = useTable();

  const hasSelection = selection.selectedCount > 0;

  return (

    <div className="datatable-toolbar">

      {/* Left */}

      <div className="datatable-toolbar-left">

        {searchable && (
          <SearchBox />
        )}

        {filterable && (
          <FilterDropdown />
        )}

        {columnVisibility && (
          <ColumnSelector />
        )}

      </div>

      {/* Right */}

      <div className="datatable-toolbar-right">

        {hasSelection && (

          <div className="datatable-selection-info">

            <span>

              {selection.selectedCount}

            </span>

            <span>

              row{selection.selectedCount > 1 ? "s" : ""} selected

            </span>

          </div>

        )}

        <RefreshButton />

        <ExportButton />

      </div>

    </div>

  );

}