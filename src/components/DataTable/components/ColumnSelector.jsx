import { useEffect, useRef, useState } from "react";
import {
  Columns3,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Column Selector
 * ============================================================================
 *
 * Features
 * --------
 * ✓ Show/Hide Columns
 * ✓ Show All
 * ✓ Hide All
 * ✓ Reset
 * ✓ Locked Columns
 */

export default function ColumnSelector() {
  const {
    columns,
    visibility,
  } = useTable();

  const {
    visibilityModel,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumns,
  } = visibility;

  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  // -------------------------------------------------------
  // Close Outside
  // -------------------------------------------------------

  useEffect(() => {
    function handleClick(e) {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  return (
    <div
      ref={ref}
      className="datatable-column-selector"
    >
      <button
        type="button"
        className="datatable-toolbar-button"
        onClick={() => setOpen((v) => !v)}
      >
        <Columns3 size={17} />

        Columns
      </button>

      {open && (
        <div className="datatable-column-menu">

          <div className="datatable-column-header">

            <span>Columns</span>

            <button
              onClick={resetColumns}
            >
              <RotateCcw size={15} />

              Reset
            </button>

          </div>

          <div className="datatable-column-actions">

            <button
              onClick={showAllColumns}
            >
              <Eye size={15} />

              Show All
            </button>

            <button
              onClick={hideAllColumns}
            >
              <EyeOff size={15} />

              Hide All
            </button>

          </div>

          <div className="datatable-column-list">

            {columns.map((column) => {

              const checked =
                visibilityModel[column.field] !== false;

              return (

                <label
                  key={column.field}
                  className="datatable-column-item"
                >

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={
                      column.hideable === false
                    }
                    onChange={() =>
                      toggleColumn(column.field)
                    }
                  />

                  <span>

                    {column.headerName ||
                      column.field}

                  </span>

                  {checked && (
                    <Check
                      size={15}
                    />
                  )}

                </label>

              );

            })}

          </div>

        </div>
      )}
    </div>
  );
}