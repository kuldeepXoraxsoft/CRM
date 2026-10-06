import { Select } from "../../components/ui";
import { THEME_OPTIONS, DENSITY_OPTIONS, LANDING_PAGE_OPTIONS } from "../../data/Settingsdata";

export default function PreferencesSection({ preferences, onChange }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-ink">Display & Behavior</h3>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Theme"
          options={THEME_OPTIONS}
          value={preferences.theme}
          onChange={(e) => onChange({ theme: e.target.value })}
        />

        <Select
          label="Table Density"
          options={DENSITY_OPTIONS}
          value={preferences.density}
          onChange={(e) => onChange({ density: e.target.value })}
        />

        <Select
          label="Default Landing Page"
          options={LANDING_PAGE_OPTIONS}
          value={preferences.landingPage}
          onChange={(e) => onChange({ landingPage: e.target.value })}
        />
      </div>
    </div>
  );
}