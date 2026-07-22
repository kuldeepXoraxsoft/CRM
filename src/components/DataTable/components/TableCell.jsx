import React from "react";

/**
 * ============================================================================
 * TableCell
 * ============================================================================
 *
 * Supports
 * --------
 * ✓ renderCell()
 * ✓ Nested field values (owner.name)
 * ✓ Value formatter
 * ✓ Cell alignment
 * ✓ Cell className
 * ✓ Cell style
 */

export default function TableCell({
    row,
    column,
}) {

    // ----------------------------------------------------
    // Read nested object values
    // ----------------------------------------------------

    function getNestedValue(object, path) {

        if (!path) return "";

        return path
            .split(".")
            .reduce((obj, key) => obj?.[key], object);

    }

    const rawValue = getNestedValue(
        row,
        column.field
    );

    // ----------------------------------------------------
    // Custom renderer
    // ----------------------------------------------------

    if (column.renderCell) {

        return (

            <td
                className={`datatable-cell ${column.cellClassName || ""}`}
                style={column.cellStyle}
            >
                {column.renderCell({
                    row,
                    value: rawValue,
                    column,
                })}
            </td>

        );

    }

    // ----------------------------------------------------
    // Value formatter
    // ----------------------------------------------------

    let displayValue = rawValue;

    if (column.valueFormatter) {

        displayValue = column.valueFormatter(
            rawValue,
            row
        );

    }

    return (

        <td
            className={`datatable-cell align-${column.align || "left"} ${column.cellClassName || ""}`}
            style={column.cellStyle}
        >

            {displayValue}

        </td>

    );

}