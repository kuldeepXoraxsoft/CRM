import {
    LayoutDashboard,
    Building2,
    UserPlus,
    UserRound,
    UsersRound,
    ClipboardCheck,
    CalendarCheck,
    Settings,
    ShieldCheck,
    Network,
    MessageSquareText,
} from "lucide-react";

export const getNavItems = (role) => {
    // Super Admin has a completely separate navigation
    if (role === "superAdmin") {
        return [
            {
                label: "Management",
                to: "/management",
                icon: ShieldCheck,
            },
            {
                label: "Settings",
                to: "/settings",
                icon: Settings,
            },
        ];
    }

    // Admin / Manager / Employee navigation
    const items = [
        {
            label: "Dashboard",
            to: "/dashboard",
            icon: LayoutDashboard,
            end: true,
        },
        {
            label: "Account",
            to: "/accounts",
            icon: Building2,
        },
        {
            label: "Leads",
            to: "/leads",
            icon: UserPlus,
        },
        // {
        //    label: "Routes",
        //    to: "/routes",
        //    icon: Network,
        // },
        // {
        //     label: "Meetings",
        //     to: "meetings",
        //     icon: CalendarCheck,
        // },
        // {
        //     label: "Tickets",
        //     to: "tickets",
        //     icon: MessageSquareText,
        // }
    ];

    // Only Admin and Manager can see Employees and Teams
    if (role === "admin" || role === "manager") {
        items.push(
            {
                label: "Employees",
                to: "/employees",
                icon: UserRound,
            },
            {
                label: "Teams",
                to: "/teams",
                icon: UsersRound,
            }
        );
    }

    items.push(
        {
            label: "Tasks",
            to: "/tasks",
            icon: ClipboardCheck,
        },
        {
            label: "Settings",
            to: "/settings",
            icon: Settings,
        }
    );

    return items;
};