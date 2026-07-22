import RowActionMenu from "../../components/DataTable/components/RowActions/RowActionMenu";
import { leadActions } from "./LeadActions";

export const leadColumns = [

    {
        field: "leadName",
        headerName: "Lead",
        sortable: true,
    },

    {
        field: "company",
        headerName: "Company",
        sortable: true,
    },

    {
        field: "email",
        headerName: "Email",
    },

    {
        field: "phone",
        headerName: "Phone",
    },

    {
        field: "status",
        headerName: "Status",
    },

    {
        field: "source",
        headerName: "Source",
    },

    {
        field: "owner.name",
        headerName: "Owner",
    },

    {
        field: "followUpDate",
        headerName: "Follow Up",
    },

    {
        field: "value",
        headerName: "Value",

        valueFormatter: (value) =>

            `₹ ${value.toLocaleString()}`
    },

    {
        field: "actions",

        headerName: "",

        sortable: false,

        hideable: false,

        width: 70,

        renderCell: ({ row }) => (

            <RowActionMenu

                row={row}

                actions={leadActions}

            />

        )

    }

];