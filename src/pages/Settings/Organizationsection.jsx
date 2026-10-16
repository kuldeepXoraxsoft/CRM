import { useState } from "react";
import { Building2, Mail, Eye, EyeOff, Send } from "lucide-react";

import { Input, Checkbox, Button, FileUpload } from "../../components/ui";

const GMAIL_PRESET = {
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpSecure: false,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SettingsCard({ icon: Icon, title, description, action, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <Icon size={18} />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * Props:
 * - organization: { companyName, defaultCurrency, smtpHost, smtpPort,
 *   smtpSecure, smtpUser, smtpPassword, smtpPasswordSet, smtpFromName,
 *   smtpFromEmail }
 * - onChange(partialUpdates): merges the updates into organization
 * - onSendTestEmail(organization): optional async function. When passed,
 *   a "Send test email" button is shown. It should resolve on success
 *   and throw on failure.
 */
export default function OrganizationSection({
  organization,
  onChange,
  onSendTestEmail,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  const smtpPort = organization.smtpPort ?? "";
  const portNumber = Number(smtpPort);

  const portError =
    smtpPort !== "" &&
    (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535)
      ? "Enter a valid port (1 - 65535)."
      : "";

  const userError =
    organization.smtpUser && !EMAIL_REGEX.test(organization.smtpUser)
      ? "Enter a valid email address."
      : "";

  const fromEmailError =
    organization.smtpFromEmail && !EMAIL_REGEX.test(organization.smtpFromEmail)
      ? "Enter a valid email address."
      : "";

  const isGmail =
    (organization.smtpHost || "").trim().toLowerCase() === "smtp.gmail.com";

  const hasPassword = Boolean(organization.smtpPassword) || Boolean(organization.smtpPasswordSet);

  const canSendTest =
    Boolean(organization.smtpHost?.trim()) &&
    Boolean(smtpPort) &&
    Boolean(organization.smtpUser?.trim()) &&
    Boolean(organization.smtpFromEmail?.trim()) &&
    hasPassword &&
    !portError &&
    !userError &&
    !fromEmailError;

  function handlePortChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
    const updates = { smtpPort: digits };

    // Standard ports: 465 = implicit SSL, 587 = STARTTLS.
    if (digits === "465") updates.smtpSecure = true;
    if (digits === "587") updates.smtpSecure = false;

    onChange(updates);
  }

  function applyGmailPreset() {
    onChange(GMAIL_PRESET);
    setTestResult(null);
  }

  async function handleSendTest() {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onSendTestEmail(organization);

      setTestResult({
        type: "success",
        message: result?.message || "Test email sent. Please check your inbox.",
      });
    } catch (err) {
      setTestResult({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not send the test email.",
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Company */}
      <SettingsCard
        icon={Building2}
        title="Company"
        description="Basic details shown across the CRM."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            value={organization.companyName || ""}
            onChange={(e) => onChange({ companyName: e.target.value })}
          />
         <FileUpload
          label="Company Logo"
          value={companyLogo}
          onChange={setCompanyLogo}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          maxSizeMB={2}
          helperText="PNG, JPG, WEBP or SVG. Maximum 2 MB."
          containerClassName="w-full"
        />
        </div>
      </SettingsCard>

      {/* Email / SMTP */}
      <SettingsCard
        icon={Mail}
        title="Email (SMTP)"
        description="Used to send password reset links and other system emails."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyGmailPreset}
          >
            Use Gmail settings
          </Button>
        }
      >
        {isGmail && (
          <div className="mb-4 rounded-md border border-primary-100 bg-primary-50 px-3 py-2.5 text-xs text-ink-muted">
            Gmail does not accept your normal account password here. Turn on
            2-Step Verification in your Google Account, create an{" "}
            <strong className="text-ink">App Password</strong>, and paste that
            16-character password below.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="SMTP Host"
            placeholder="smtp.gmail.com"
            autoComplete="off"
            value={organization.smtpHost || ""}
            onChange={(e) => onChange({ smtpHost: e.target.value })}
          />

          <Input
            label="SMTP Port"
            placeholder="587"
            inputMode="numeric"
            autoComplete="off"
            value={smtpPort}
            error={portError}
            onChange={handlePortChange}
          />

          <Input
            label="SMTP User Email"
            type="email"
            placeholder="you@gmail.com"
            autoComplete="off"
            value={organization.smtpUser || ""}
            error={userError}
            onChange={(e) => onChange({ smtpUser: e.target.value })}
          />

          <Input
            label="SMTP Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={
              organization.smtpPasswordSet
                ? "Leave blank to keep the current password"
                : "Enter app password"
            }
            helperText={
              organization.smtpPasswordSet
                ? "A password is already saved. Type here only if you want to replace it."
                : ""
            }
            value={organization.smtpPassword || ""}
            onChange={(e) => onChange({ smtpPassword: e.target.value })}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center text-ink-faint hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            label="From Name"
            placeholder="Cyvora CRM"
            autoComplete="off"
            value={organization.smtpFromName || ""}
            onChange={(e) => onChange({ smtpFromName: e.target.value })}
          />

          <Input
            label="From Email"
            type="email"
            placeholder="no-reply@yourcompany.com"
            autoComplete="off"
            value={organization.smtpFromEmail || ""}
            error={fromEmailError}
            helperText={
              isGmail
                ? "Gmail usually replaces this with the SMTP user email."
                : ""
            }
            onChange={(e) => onChange({ smtpFromEmail: e.target.value })}
          />

          <div className="sm:col-span-2">
            <Checkbox
              label="Use secure connection (SSL)"
              description="Turn on for port 465. Keep it off for port 587 (STARTTLS)."
              checked={Boolean(organization.smtpSecure)}
              onChange={(e) => onChange({ smtpSecure: e.target.checked })}
            />
          </div>
        </div>

        {onSendTestEmail && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Send size={14} />}
              onClick={handleSendTest}
              disabled={!canSendTest || isTesting}
            >
              {isTesting ? "Sending..." : "Send test email"}
            </Button>

            {testResult && (
              <p
                className={`text-xs font-medium ${
                  testResult.type === "success"
                    ? "text-success-600"
                    : "text-danger-500"
                }`}
              >
                {testResult.message}
              </p>
            )}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}