import Toggle from "../../components/ui/Toggle";
import { NOTIFICATION_PREFERENCES } from "../../data/SettingsData";

export default function NotificationsSection({ notifications, onChange }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">In-app Notifications</h3>
      <p className="mb-2 text-xs text-ink-muted">
        Choose what you want to be notified about. (Email notifications coming soon.)
      </p>

      <div className="divide-y divide-border">
        {NOTIFICATION_PREFERENCES.map((pref) => (
          <Toggle
            key={pref.key}
            label={pref.label}
            description={pref.description}
            checked={!!notifications[pref.key]}
            onChange={(value) => onChange({ [pref.key]: value })}
          />
        ))}
      </div>
    </div>
  );
}