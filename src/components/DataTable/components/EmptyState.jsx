import {
    Inbox,
    SearchX,
    FilterX,
    RefreshCw,
    Plus,
} from "lucide-react";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Empty State
 * ============================================================================
 *
 * Shows different UI depending on why the table is empty.
 */

export default function EmptyState() {

    const {
        filtering,
        onRefresh,
        emptyState,
    } = useTable();

    const hasSearch =
        filtering.globalSearch?.trim().length > 0;

    const hasFilters =
        filtering.filters.length > 0;

    // ------------------------------------------------------------

    let Icon = Inbox;

    let title = "No records found";

    let description =
        "There is no data available.";

    if (hasSearch) {

        Icon = SearchX;

        title = "No matching results";

        description =
            "Try another search keyword.";

    }
    else if (hasFilters) {

        Icon = FilterX;

        title = "No records match the filters";

        description =
            "Modify or clear the filters.";

    }

    if (emptyState) {

        Icon = emptyState.icon || Icon;

        title = emptyState.title || title;

        description =
            emptyState.description || description;

    }

    // ------------------------------------------------------------

    return (

        <tbody>

            <tr>

                <td
                    colSpan={999}
                    className="datatable-empty-cell"
                >

                    <div className="datatable-empty">

                        <div className="datatable-empty-icon">

                            <Icon size={42} />

                        </div>

                        <h3>

                            {title}

                        </h3>

                        <p>

                            {description}

                        </p>

                        <div className="datatable-empty-actions">

                            {onRefresh && (

                                <button
                                    className="datatable-toolbar-button"
                                    onClick={onRefresh}
                                >

                                    <RefreshCw size={16} />

                                    Refresh

                                </button>

                            )}

                            {emptyState?.onCreate && (

                                <button
                                    className="datatable-primary-button"
                                    onClick={
                                        emptyState.onCreate
                                    }
                                >

                                    <Plus size={16} />

                                    {emptyState.createLabel ??
                                        "Create"}

                                </button>

                            )}

                        </div>

                    </div>

                </td>

            </tr>

        </tbody>

    );

}   