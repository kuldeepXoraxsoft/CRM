import {
    Eye,
    Pencil,
    CalendarDays,
    UserCheck,
    Phone,
    Mail,
    Trash2,
} from "lucide-react";

export const leadActions = [

    {
        id: "view",
        label: "View Lead",
        icon: <Eye size={16} />,
        onClick: (lead) => {

            console.log("View", lead);

        },
    },

    {
        id: "edit",
        label: "Edit Lead",
        icon: <Pencil size={16} />,
        onClick: (lead) => {

            console.log("Edit", lead);

        },
    },

    {
        id: "followup",
        label: "Schedule Follow Up",
        icon: <CalendarDays size={16} />,
        onClick: (lead) => {

            console.log("Follow Up", lead);

        },
    },

    {
        id: "assign",
        label: "Assign Owner",
        icon: <UserCheck size={16} />,
        onClick: (lead) => {

            console.log("Assign", lead);

        },
    },

    {
        id: "call",
        label: "Call",
        icon: <Phone size={16} />,
        onClick: (lead) => {

            console.log("Call", lead);

        },
    },

    {
        id: "mail",
        label: "Send Email",
        icon: <Mail size={16} />,
        onClick: (lead) => {

            console.log("Mail", lead);

        },
    },

    {
        divider: true,
    },

    {
        id: "delete",
        label: "Delete Lead",
        icon: <Trash2 size={16} />,
        danger: true,
        onClick: (lead) => {

            console.log("Delete", lead);

        },
    },

];