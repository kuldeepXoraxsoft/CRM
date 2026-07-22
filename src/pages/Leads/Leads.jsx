import { useState } from "react";

import DataTable from "../../components/DataTable/DataTable";

import { leadColumns } from "./LeadColumns";
import { mockLeads } from "../../data/mockLeads";

export default function LeadsPage() {

    const [rows, setRows] = useState(mockLeads);

    const [loading, setLoading] = useState(false);

    // ----------------------------------------------------------------------

    async function handleRefresh() {

        setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        setRows([...mockLeads]);

        setLoading(false);

    }

    // ----------------------------------------------------------------------

    function handleDelete(selectedRows) {

        const ids = new Set(selectedRows.map(row => row.id));

        setRows(prev => prev.filter(row => !ids.has(row.id)));

    }

    // ----------------------------------------------------------------------

    function handleExport(selectedRows) {

        console.log("Export", selectedRows);

    }

    // ----------------------------------------------------------------------

    function handleAssign(selectedRows) {

        console.log("Assign", selectedRows);

    }

    // ----------------------------------------------------------------------

    function handleStatus(selectedRows) {

        console.log("Status", selectedRows);

    }

    // ----------------------------------------------------------------------

    return (

        <div className="flex flex-col gap-5">

            {/* Page Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl  font-semibold">

                        Leads

                    </h1>

                    <p className="text-sm text-gray-500">

                        Manage all your leads from one place.

                    </p>

                </div>

                <button
                    className="rounded-md bg-primary px-4 py-2 text-white"
                >

                    + Add Lead

                </button>

            </div>

            {/* Table */}

            <DataTable

                rows={rows}

                columns={leadColumns}

                loading={loading}

                selectable={true}

                search={true}

                filtering={true}

                sorting={true}

                pagination={true}

                exportable={true}

                refreshable={true}

                columnVisibility={true}

                pageSize={10}

                getRowId={(row) => row.id}

                onRefresh={handleRefresh}

                bulkActions={{

                    delete: handleDelete,

                    export: handleExport,

                    assign: handleAssign,

                    status: handleStatus,

                }}

                emptyState={{

                    title: "No Leads Found",

                    description:

                        "Start by adding your first lead.",

                    createLabel: "Add Lead",

                    onCreate: () => {

                        console.log("Create Lead");

                    },

                }}

            />

        </div>

    );

}