import { ShieldAlert } from "lucide-react";

import ErrorPage from "../../components/ErrorPage";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/roles";

export default function Unauthorized() {
  const { currentUser } = useAuth();

  const roleLabel = currentUser
    ? ROLE_LABELS[currentUser.role] ?? currentUser.role
    : null;

  return (
    <ErrorPage
      tone="danger"
      icon={ShieldAlert}
      code="403"
      title="Access denied"
      message={
        roleLabel
          ? `Your role (${roleLabel}) doesn't have permission to view this page. If you think this is a mistake, please contact your administrator.`
          : "You don't have permission to view this page. If you think this is a mistake, please contact your administrator."
      }
    />
  );
}