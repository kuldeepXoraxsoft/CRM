import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/ui/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/Login/ForgotPassword";
import ResetPassword from "../pages/Login/ResetPassword";
import NotFound from "../pages/Errors/NotFound";

import Dashboard from "../pages/Dashboard/Dashboard";
import Account from "../pages/Accounts/Account";
import Leads from "../pages/Leads/Leads";
import Tasks from "../pages/Tasks/Tasks";
import Employees from "../pages/Employee/Employee";
import Teams from "../pages/Teams/Teams";
import Settings from "../pages/Settings/Settings";
import AccountRoutes from "../pages/Routes/Routes";
import Management from "../pages/Management/Management";
import Meetings from "../pages/Meetings/Meetings";
import Tickets from "../pages/Tickets/Tickets";
import AccountDetails from "../pages/Accounts/AccountDetails";

// Same role groups as config/navigation.js (sidebar), so menu and access always match
const STAFF = ["employee", "manager", "admin"]; // everyone except superAdmin
const LEADERSHIP = ["manager", "admin"];
const SUPER_ADMIN = ["superAdmin"];
const ALL = ["superAdmin", "admin", "manager", "employee"];

export default function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public */}
                <Route path="/" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected: must be logged in */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >

                    {/* Admin / Manager / Employee */}
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute allowedRoles={STAFF}><Dashboard /></ProtectedRoute>}
                    />
                    <Route
                        path="/accounts"
                        element={<ProtectedRoute allowedRoles={STAFF}><Account /></ProtectedRoute>}
                    />
                    <Route 
                        path="/accounts/:id" 
                        element={<ProtectedRoute allowedRoles={STAFF}><AccountDetails /></ProtectedRoute>}
                    />
                    <Route
                        path="/leads"
                        element={<ProtectedRoute allowedRoles={STAFF}><Leads /></ProtectedRoute>}
                    />
                    <Route
                        path="/tasks"
                        element={<ProtectedRoute allowedRoles={STAFF}><Tasks /></ProtectedRoute>}
                    />
                    <Route
                        path="/meetings"
                        element={<ProtectedRoute allowedRoles={STAFF}><Meetings /></ProtectedRoute>}
                    />
                    <Route
                        path="/tickets"
                        element={<ProtectedRoute allowedRoles={STAFF}><Tickets /></ProtectedRoute>}
                    />
                    <Route
                        path="/routes"
                        element={<ProtectedRoute allowedRoles={STAFF}><AccountRoutes /></ProtectedRoute>}
                    />
                    <Route
                        path="/teams"
                        element={<ProtectedRoute allowedRoles={STAFF}><Teams /></ProtectedRoute>}
                    />

                    {/* Admin / Manager only */}
                    <Route
                        path="/employees"
                        element={<ProtectedRoute allowedRoles={LEADERSHIP}><Employees /></ProtectedRoute>}
                    />

                    {/* Super Admin only */}
                    <Route
                        path="/management"
                        element={<ProtectedRoute allowedRoles={SUPER_ADMIN}><Management /></ProtectedRoute>}
                    />
                    <Route
                        path="/settings"
                        element={<ProtectedRoute allowedRoles={ALL}><Settings /></ProtectedRoute>}
                    />

                </Route>

                {/* 404 - any unknown URL */}
                <Route path="*" element={<NotFound />} />

            </Routes>

        </BrowserRouter>
    );
}