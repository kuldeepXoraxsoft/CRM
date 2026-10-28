import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationContext";

export default function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <AppRoutes />
      </OrganizationProvider>
    </AuthProvider>
  );
}