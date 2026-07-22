import {
    Trash2,
    UserCheck,
    RotateCcw,
    Download,
    X,
} from "lucide-react";

import { useTable } from "../context/TableContext";

/**
 * ============================================================================
 * Bulk Action Toolbar
 * ============================================================================
 *
 * Appears only when rows are selected.
 *
 * Supports:
 *
 * ✓ Delete
 * ✓ Export
 * ✓ Assign Owner
 * ✓ Change Status
 * ✓ Clear Selection
 *
 */

export default function BulkActionToolbar() {

    const {

        selection,

        bulkActions,

    } = useTable();

    const {

        selectedRows,

        selectedCount,

        clearSelection,

    } = selection;

    if (!selectedCount) return null;

    return (

        <div className="datatable-bulk-toolbar">

            <div className="datatable-bulk-left">

                <strong>

                    {selectedCount}

                </strong>

                <span>

                    Selected

                </span>

            </div>

            <div className="datatable-bulk-actions">

                {bulkActions?.assign && (

                    <button

                        onClick={()=>

                            bulkActions.assign(selectedRows)

                        }

                    >

                        <UserCheck size={16}/>

                        Assign

                    </button>

                )}

                {bulkActions?.status && (

                    <button

                        onClick={()=>

                            bulkActions.status(selectedRows)

                        }

                    >

                        <RotateCcw size={16}/>

                        Status

                    </button>

                )}

                {bulkActions?.export && (

                    <button

                        onClick={()=>

                            bulkActions.export(selectedRows)

                        }

                    >

                        <Download size={16}/>

                        Export

                    </button>

                )}

                {bulkActions?.delete && (

                    <button

                        className="danger"

                        onClick={()=>

                            bulkActions.delete(selectedRows)

                        }

                    >

                        <Trash2 size={16}/>

                        Delete

                    </button>

                )}

                <button

                    onClick={clearSelection}

                >

                    <X size={16}/>

                    Clear

                </button>

            </div>

        </div>

    );

}