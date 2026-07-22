import { useTable } from "../context/TableContext";
import TableCell from "./TableCell";

/**
 * ============================================================================
 * TableRow
 * ============================================================================
 *
 * Responsibilities
 * ----------------
 * ✓ Render one row
 * ✓ Handle row selection
 * ✓ Handle row click
 * ✓ Apply selected styles
 * ✓ Render all cells
 *
 */

export default function TableRow({ row }) {

    const {

        visibleColumns,

        selectable,

        selection,

        getRowId,

        onRowClick,

    } = useTable();

    const rowId = getRowId(row);

    const isSelected = selection.isSelected(rowId);

    function handleCheckboxChange(e) {

        e.stopPropagation();

        selection.toggleRow(row, {
            shiftKey: e.shiftKey,
        });

    }

    function handleRowClick() {

        onRowClick?.(row);

    }

    return (

        <tr
            className={`datatable-row ${
                isSelected ? "datatable-row-selected" : ""
            }`}
            onClick={handleRowClick}
        >

            {selectable && (

                <td className="datatable-checkbox-cell">

                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                    />

                </td>

            )}

            {visibleColumns.map((column) => (

                <TableCell
                    key={column.field}
                    row={row}
                    column={column}
                />

            ))}

        </tr>

    );

}