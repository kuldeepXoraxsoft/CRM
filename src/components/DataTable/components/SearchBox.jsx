import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * SearchBox
 * ============================================================================
 *
 * Global table search.
 *
 * Features
 * --------
 * ✓ Debounced search
 * ✓ Clear button
 * ✓ Search icon
 * ✓ Responsive
 */

const DEBOUNCE_DELAY = 300;

export default function SearchBox() {
  const { filtering } = useTable();

  const { globalSearch, setGlobalSearch } = filtering;

  const [value, setValue] = useState(globalSearch);

  // ---------------------------------------------------
  // Debounce Search
  // ---------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalSearch(value);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [value, setGlobalSearch]);

  // ---------------------------------------------------
  // Clear
  // ---------------------------------------------------

  function handleClear() {
    setValue("");
    setGlobalSearch("");
  }

  return (
    <div className="datatable-search">

      <Search
        size={18}
        className="datatable-search-icon"
      />

      <input
        type="text"
        value={value}
        placeholder="Search..."
        onChange={(e) => setValue(e.target.value)}
        className="datatable-search-input"
      />

      {value && (
        <button
          type="button"
          className="datatable-search-clear"
          onClick={handleClear}
        >
          <X size={16} />
        </button>
      )}

    </div>
  );
}