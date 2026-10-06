import { Input, Select } from "../../components/ui";
import { CURRENCY_OPTIONS } from "../../data/Settingsdata";

export default function OrganizationSection({ organization, onChange }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-ink">Company</h3>
      <p className="mb-4 text-xs text-ink-muted">
        Visible to everyone in the organization. Only Managers and Admins can edit this.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company Name"
          value={organization.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
        />

        <Select
          label="Default Currency"
          options={CURRENCY_OPTIONS}
          value={organization.defaultCurrency}
          onChange={(e) => onChange({ defaultCurrency: e.target.value })}
        />
      </div>
    </div>
  );
}