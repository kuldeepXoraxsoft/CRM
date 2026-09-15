import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/ui/Layout";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Account from "../pages/Accounts/Account";
import Leads from "../pages/Leads/Leads";
import Tasks from "../pages/Tasks/Tasks";
import Employees from "../pages/Employee/Employee";
import Teams from "../pages/Teams/Teams";
import Settings from "../pages/Settings/Settings";
import AccountRoutes from "../pages/Routes/Routes";
import Management from "../pages/Management/Management";

export default function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public */}

                <Route
                    path="/"
                    element={<Login />}
                />

                {/* Protected */}

                <Route element={<Layout />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/accounts"
                        element={<Account />}
                    />

                    <Route
                        path="/leads"
                        element={<Leads />}
                    />

                    <Route
                        path="/tasks"
                        element={<Tasks />}
                    />

                    <Route
                      path="/routes"
                      element= {<AccountRoutes/>}
                    />

                    <Route
                        path="/employees"
                        element={<Employees />}
                    />

                    <Route
                        path="/teams"
                        element={<Teams />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                    <Route 
                       path="/management"
                       element={<Management />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}