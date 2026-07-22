import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Table Pagination
 * ============================================================================
 */

export default function TablePagination() {

    const {
        paginationHook,
    } = useTable();

    const {

        page,

        pageSize,

        totalRows,

        totalPages,

        startRow,

        endRow,

        setPage,

        setPageSize,

    } = paginationHook;

    return (

        <div className="datatable-pagination">

            <div className="datatable-pagination-left">

                <span>

                    Rows per page

                </span>

                <select
                    value={pageSize}
                    onChange={(e) =>
                        setPageSize(Number(e.target.value))
                    }
                >

                    {[10, 25, 50, 100].map(size => (

                        <option
                            key={size}
                            value={size}
                        >

                            {size}

                        </option>

                    ))}

                </select>

            </div>

            <div className="datatable-pagination-right">

                <span>

                    {startRow}-{endRow} of {totalRows}

                </span>

                <button
                    disabled={page === 0}
                    onClick={() => setPage(0)}
                >

                    <ChevronsLeft size={17} />

                </button>

                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                >

                    <ChevronLeft size={17} />

                </button>

                <span className="datatable-page-number">

                    {page + 1} / {totalPages}

                </span>

                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                >

                    <ChevronRight size={17} />

                </button>

                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(totalPages - 1)}
                >

                    <ChevronsRight size={17} />

                </button>

            </div>

        </div>

    );

}