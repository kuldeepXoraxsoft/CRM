import { Download, FileSpreadsheet } from "lucide-react";
import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Export Button
 * ============================================================================
 *
 * Features
 * --------
 * ✓ Export CSV
 * ✓ Visible columns only
 * ✓ Selected rows (if available)
 * ✓ Filtered rows
 */

export default function ExportButton() {

    const {
        visibleColumns,
        displayRows,
        selection,
        getRowId,
    } = useTable();

    function getNestedValue(object, path) {

        return path
            .split(".")
            .reduce((obj, key) => obj?.[key], object);

    }

    function exportCSV() {

        const rows =
            selection.selectedCount > 0
                ? displayRows.filter(row =>
                      selection.isSelected(getRowId(row))
                  )
                : displayRows;

        const headers = visibleColumns.map(
            column => column.headerName || column.field
        );

        const csvRows = rows.map(row =>

            visibleColumns.map(column => {

                const value = getNestedValue(
                    row,
                    column.field
                );

                if (value === null || value === undefined)
                    return "";

                return `"${String(value).replace(/"/g, '""')}"`;

            })

        );

        const csv = [

            headers.join(","),

            ...csvRows.map(row => row.join(","))

        ].join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `export-${Date.now()}.csv`;

        link.click();

        URL.revokeObjectURL(url);

    }

    return (

        <button
            className="datatable-toolbar-button"
            onClick={exportCSV}
        >

            <Download size={16} />

            Export

        </button>

    );

}