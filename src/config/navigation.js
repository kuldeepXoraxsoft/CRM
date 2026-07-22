import {
    LayoutDashboard,
    Users,
    UserPlus,
    Briefcase,
    CheckSquare,
    Settings,
} from "lucide-react";

export const NAV_ITEMS = [

    {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        end: true,
    },

    {
        label: "Account",
        to: "/accounts",
        icon: Users,
    },

    {
        label: "Leads",
        to: "/leads",
        icon: UserPlus,
    },

   

    {
        label: "Tasks",
        to: "/tasks",
        icon: CheckSquare,
    },

    {
        label: "Settings",
        to: "/settings",
        icon: Settings,
    },
];