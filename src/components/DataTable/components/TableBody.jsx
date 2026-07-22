import { Fragment } from "react";

import { useTable } from "../context/TableContext";

import TableRow from "./TableRow";

/**
 * ============================================================================
 * Table Body
 * ============================================================================
 *
 * Responsible only for rendering rows.
 *
 * Row rendering is delegated to <TableRow />
 */

export default function TableBody() {

    const {
        displayRows,
        getRowId,
    } = useTable();

    return (

        <tbody className="datatable-tbody">

            {displayRows.map((row) => (

                <Fragment key={getRowId(row)}>

                    <TableRow row={row} />

                </Fragment>

            ))}

        </tbody>

    );

}