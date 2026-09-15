import { useAuth } from "../context/AuthContext";
import { ROLES, ROLE_LABELS } from "../utils/roles";

/**
 * DEV-ONLY widget to switch between Employee / Manager / Admin while you
 * don't have real login yet. Drop it in your topbar/sidebar. Remove it
 * (or hide behind an env flag) once real auth is wired up.
 */
export default function RoleSwitcher() {
  const { currentUser, switchRole } = useAuth();

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-canvas px-2.5 py-1.5">
      <span className="text-xs text-ink-faint">Viewing as</span>
      <select
        className="border-none bg-transparent text-xs font-semibold text-ink outline-none"
        value={currentUser?.role}
        onChange={(e) => switchRole(e.target.value)}
      >
        {Object.values(ROLES).map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </div>
  );
}