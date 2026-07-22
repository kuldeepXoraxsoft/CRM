import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * LoadingState
 * ============================================================================
 *
 * Renders skeleton rows while data is loading.
 *
 * Features
 * --------
 * ✓ Matches current columns
 * ✓ Matches page size
 * ✓ Supports selection column
 * ✓ No layout shift
 */

export default function LoadingState() {

    const {
        visibleColumns,
        selectable,
        paginationHook,
    } = useTable();

    const rows = paginationHook.pageSize || 10;

    return (

        <tbody className="datatable-loading-body">

            {Array.from({ length: rows }).map((_, rowIndex) => (

                <tr
                    key={rowIndex}
                    className="datatable-loading-row"
                >

                    {selectable && (

                        <td className="datatable-checkbox-cell">

                            <div className="datatable-skeleton checkbox" />

                        </td>

                    )}

                    {visibleColumns.map((column) => (

                        <td
                            key={column.field}
                            className="datatable-cell"
                        >

                            <div
                                className="datatable-skeleton"
                                style={{
                                    width:
                                        column.width
                                            ? `${Math.min(column.width * 0.6, 180)}px`
                                            : "70%",
                                }}
                            />

                        </td>

                    ))}

                </tr>

            ))}

        </tbody>

    );

}