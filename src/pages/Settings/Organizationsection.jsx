import { useCallback, useEffect, useState } from "react";
import { Building2, Mail, Eye, EyeOff, Send, Trash2 } from "lucide-react";

import {
  Input,
  Checkbox,
  Button,
  FileUpload,
  Select,
  Spinner,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/toastContext";
import { useOrganization } from "../../context/OrganizationContext";
import { organizationApi } from "../../api/Organizationapi";
import managementApi from "../../api/Managementapi";

const GMAIL_PRESET = {
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpSecure: false,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_EMAIL = {
  smtpHost: "",
  smtpPort: "587",
  smtpSecure: false,
  allowInvalidCert: false,
  smtpUser: "",
  smtpPassword: "",
  smtpPasswordSet: false,
  smtpFromName: "",
  smtpFromEmail: "",
};

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });

const apiMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

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
 * Settings > Organization
 *  - Company name + logo (global; only superAdmin can change)
 *  - Email (SMTP) settings, one set per department
 *      admin      -> edits their own department
 *      superAdmin -> picks any department
 * Loads and saves by itself (no props needed).
 */
export default function OrganizationSection() {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const org = useOrganization();

  const isSuperAdmin = currentUser?.role === "superAdmin";
  const canEditCompany = isSuperAdmin;

  // ---------------- Company ----------------
  const [nameDraft, setNameDraft] = useState(null); // null = not edited, show saved name
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);

  const companyName = nameDraft ?? org.savedCompanyName;

  const companyDirty =
    companyName.trim() !== org.savedCompanyName || Boolean(logoFile) || removeLogo;

  async function handleSaveCompany() {
    const name = companyName.trim();

    if (!name) {
      toastError("Company name is required.");
      return;
    }

    setCompanySaving(true);

    try {
      const payload = { companyName: name };

      if (removeLogo) payload.removeLogo = true;
      else if (logoFile) payload.logo = await readAsDataUrl(logoFile);

      const result = await organizationApi.update(payload);

      org.apply(result); // sidebar / navbar / login pick it up immediately
      setNameDraft(null);
      setLogoFile(null);
      setRemoveLogo(false);
      success("Company details saved.");
    } catch (err) {
      toastError(apiMessage(err, "Failed to save company details."));
    } finally {
      setCompanySaving(false);
    }
  }

  // ---------------- Department email ----------------
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(""); // superAdmin's selection
  const [email, setEmail] = useState(EMPTY_EMAIL);
  const [meta, setMeta] = useState({
    departmentName: "",
    configured: false,
    usingFallback: false,
  });
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [loadedKey, setLoadedKey] = useState(null); // which department's settings are on screen
  const [emailSaving, setEmailSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const applyEmailResponse = useCallback((result) => {
    setEmail({
      smtpHost: result.smtpHost || "",
      smtpPort: result.smtpPort || "587",
      smtpSecure: Boolean(result.smtpSecure),
      allowInvalidCert: Boolean(result.allowInvalidCert),
      smtpUser: result.smtpUser || "",
      smtpPassword: "", // never sent back by the server
      smtpPasswordSet: Boolean(result.smtpPasswordSet),
      smtpFromName: result.smtpFromName || "",
      smtpFromEmail: result.smtpFromEmail || "",
    });
    setMeta({
      departmentName: result.departmentName || "",
      configured: Boolean(result.configured),
      usingFallback: Boolean(result.usingFallback),
    });
  }, []);

  // superAdmin: load department list, preselect the first one
  useEffect(() => {
    if (!isSuperAdmin) return undefined;

    let cancelled = false;

    managementApi
      .getDepartments()
      .then((result) => {
        if (cancelled) return;
        const list = result?.data || [];
        setDepartments(list);
        if (list.length > 0) setDepartmentId((current) => current || list[0].id);
        setDepartmentsLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setDepartmentsLoaded(true);
        toastError(apiMessage(err, "Failed to load departments."));
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, toastError]);

  // Load the email settings of the active department
  const activeKey = isSuperAdmin ? departmentId : "self";

  useEffect(() => {
    if (!activeKey) return undefined;

    let cancelled = false;

    organizationApi
      .getEmailConfig(isSuperAdmin ? departmentId : undefined)
      .then((result) => {
        if (!cancelled) applyEmailResponse(result);
      })
      .catch((err) => {
        if (!cancelled) toastError(apiMessage(err, "Failed to load email settings."));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(activeKey);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, activeKey, departmentId, applyEmailResponse, toastError]);

  const emailLoading = isSuperAdmin
    ? !departmentsLoaded || (Boolean(departmentId) && loadedKey !== departmentId)
    : loadedKey !== "self";

  function handleDepartmentChange(e) {
    setDepartmentId(e.target.value);
    setTestResult(null);
    setShowPassword(false);
  }

  function updateEmail(updates) {
    setEmail((prev) => ({ ...prev, ...updates }));
    setTestResult(null);
  }

  const smtpPort = email.smtpPort ?? "";
  const portNumber = Number(smtpPort);

  const portError =
    smtpPort !== "" &&
    (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535)
      ? "Enter a valid port (1 - 65535)."
      : "";

  const userError =
    email.smtpUser && !EMAIL_REGEX.test(email.smtpUser)
      ? "Enter a valid email address."
      : "";

  const fromEmailError =
    email.smtpFromEmail && !EMAIL_REGEX.test(email.smtpFromEmail)
      ? "Enter a valid email address."
      : "";

  const isGmail = email.smtpHost.trim().toLowerCase() === "smtp.gmail.com";
  const hasPassword = Boolean(email.smtpPassword) || email.smtpPasswordSet;

  const formValid =
    Boolean(email.smtpHost.trim()) &&
    Boolean(smtpPort) &&
    Boolean(email.smtpUser.trim()) &&
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

    updateEmail(updates);
  }

  const buildEmailPayload = () => ({
    ...(isSuperAdmin ? { departmentId } : {}),
    smtpHost: email.smtpHost.trim(),
    smtpPort: Number(email.smtpPort),
    smtpSecure: email.smtpSecure,
    allowInvalidCert: email.allowInvalidCert,
    smtpUser: email.smtpUser.trim(),
    // blank => server keeps the saved password
    ...(email.smtpPassword ? { smtpPassword: email.smtpPassword } : {}),
    smtpFromName: email.smtpFromName.trim(),
    smtpFromEmail: email.smtpFromEmail.trim(),
  });

  async function handleSaveEmail() {
    setEmailSaving(true);

    try {
      const result = await organizationApi.saveEmailConfig(buildEmailPayload());
      applyEmailResponse(result);
      setTestResult(null);
      success(`Email settings saved for ${result.departmentName}.`);
    } catch (err) {
      toastError(apiMessage(err, "Failed to save email settings."));
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleSendTest() {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await organizationApi.sendTestEmail(buildEmailPayload());

      setTestResult({
        type: "success",
        message: result?.message || "Test email sent. Please check your inbox.",
      });
    } catch (err) {
      setTestResult({
        type: "error",
        message: apiMessage(err, "Could not send the test email."),
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleRemoveEmail() {
    const confirmed = window.confirm(
      `Remove the email settings of ${meta.departmentName || "this department"}? Its emails will use the server's default account (if one is set).`
    );

    if (!confirmed) return;

    setRemoving(true);

    try {
      const result = await organizationApi.deleteEmailConfig(
        isSuperAdmin ? departmentId : undefined
      );
      applyEmailResponse(result);
      setTestResult(null);
      success("Email settings removed.");
    } catch (err) {
      toastError(apiMessage(err, "Failed to remove email settings."));
    } finally {
      setRemoving(false);
    }
  }

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const noDepartments = isSuperAdmin && departmentsLoaded && departments.length === 0;

  return (
    <div className="space-y-5">
      {/* Company */}
      <SettingsCard
        icon={Building2}
        title="Company"
        description={
          canEditCompany
            ? "Name and logo shown across the CRM and in emails."
            : "Name and logo shown across the CRM. Only a super admin can change these."
        }
        action={
          canEditCompany && (
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCompany}
              loading={companySaving}
              disabled={!companyDirty || !companyName.trim()}
            >
              Save company
            </Button>
          )
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            value={companyName}
            disabled={!canEditCompany}
            maxLength={100}
            onChange={(e) => setNameDraft(e.target.value)}
          />

          <div className="space-y-3">
            {org.hasCustomLogo && !removeLogo && !logoFile && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <img
                  src={org.customLogoUrl}
                  alt="Current company logo"
                  className="h-16 w-16 shrink-0 rounded-md border border-border object-contain"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">Current logo</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Upload a new file below to replace it.
                  </p>
                </div>

                {canEditCompany && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setRemoveLogo(true)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}

            {removeLogo && (
              <p className="text-xs text-ink-muted">
                The logo will be removed when you save.{" "}
                <button
                  type="button"
                  className="font-medium text-primary-600 hover:underline"
                  onClick={() => setRemoveLogo(false)}
                >
                  Undo
                </button>
              </p>
            )}

            <FileUpload
              label={org.hasCustomLogo ? "Replace Logo" : "Company Logo"}
              value={logoFile}
              onChange={(file) => {
                setLogoFile(file);
                if (file) setRemoveLogo(false);
              }}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              maxSizeMB={2}
              disabled={!canEditCompany}
              helperText="PNG, JPG, WEBP or SVG. Maximum 2 MB. Use PNG/JPG for emails (Gmail and Outlook don't show SVG)."
              containerClassName="w-full"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Email / SMTP (per department) */}
      <SettingsCard
        icon={Mail}
        title="Email (SMTP)"
        description="Each department sends password reset links and system emails from its own email account."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              updateEmail(GMAIL_PRESET);
            }}
            disabled={emailLoading || noDepartments}
          >
            Use Gmail settings
          </Button>
        }
      >
        {isSuperAdmin && (
          <div className="mb-4 max-w-sm">
            <Select
              label="Department"
              placeholder="Select a department"
              options={departmentOptions}
              value={departmentId}
              onChange={handleDepartmentChange}
            />
          </div>
        )}

        {!isSuperAdmin && meta.departmentName && (
          <p className="mb-4 text-xs text-ink-muted">
            Department:{" "}
            <span className="font-semibold text-ink">{meta.departmentName}</span>
          </p>
        )}

        {noDepartments ? (
          <p className="text-sm text-ink-muted">
            Create a department first (Management &gt; Departments), then set up
            its email here.
          </p>
        ) : emailLoading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-ink-muted">
            <Spinner />
            Loading email settings...
          </div>
        ) : (
          <>
            {meta.configured ? (
              <div className="mb-4 rounded-md border border-success-500/30 bg-success-50 px-3 py-2.5 text-xs text-ink-muted">
                {meta.departmentName} sends emails from its own email account.
              </div>
            ) : meta.usingFallback ? (
              <div className="mb-4 rounded-md border border-primary-100 bg-primary-50 px-3 py-2.5 text-xs text-ink-muted">
                No email is set for {meta.departmentName || "this department"}{" "}
                yet. Its emails currently go out from the server&apos;s default
                account. Save the details below to use its own.
              </div>
            ) : (
              <div className="mb-4 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2.5 text-xs text-ink-muted">
                Email is not set up for{" "}
                {meta.departmentName || "this department"}, so it can&apos;t
                send emails (password resets, welcome emails) yet.
              </div>
            )}

            {isGmail && (
              <div className="mb-4 rounded-md border border-primary-100 bg-primary-50 px-3 py-2.5 text-xs text-ink-muted">
                Gmail does not accept your normal account password here. Turn on
                2-Step Verification in your Google Account, create an{" "}
                <strong className="text-ink">App Password</strong>, and paste
                that 16-character password below.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="SMTP Host"
                placeholder="smtp.gmail.com"
                autoComplete="off"
                value={email.smtpHost}
                onChange={(e) => updateEmail({ smtpHost: e.target.value })}
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
                value={email.smtpUser}
                error={userError}
                onChange={(e) => updateEmail({ smtpUser: e.target.value })}
              />

              <Input
                label="SMTP Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={
                  email.smtpPasswordSet
                    ? "Leave blank to keep the current password"
                    : "Enter app password"
                }
                helperText={
                  email.smtpPasswordSet
                    ? "A password is already saved. Type here only if you want to replace it."
                    : ""
                }
                value={email.smtpPassword}
                onChange={(e) => updateEmail({ smtpPassword: e.target.value })}
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
                placeholder={meta.departmentName || "Sales Team"}
                autoComplete="off"
                value={email.smtpFromName}
                onChange={(e) => updateEmail({ smtpFromName: e.target.value })}
              />

              <Input
                label="From Email"
                type="email"
                placeholder="no-reply@yourcompany.com"
                autoComplete="off"
                value={email.smtpFromEmail}
                error={fromEmailError}
                helperText={
                  isGmail
                    ? "Gmail usually replaces this with the SMTP user email."
                    : "Leave blank to use the SMTP user email."
                }
                onChange={(e) => updateEmail({ smtpFromEmail: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Checkbox
                  label="Use secure connection (SSL)"
                  description="Turn on for port 465. Keep it off for port 587 (STARTTLS)."
                  checked={Boolean(email.smtpSecure)}
                  onChange={(e) => updateEmail({ smtpSecure: e.target.checked })}
                />
              </div>

              <div className="sm:col-span-2">
                <Checkbox
                  label="Skip certificate check (less secure)"
                  description="Only turn on if your mail server's certificate doesn't match its hostname (the error mentions altnames) and you can't use the hostname on the certificate."
                  checked={Boolean(email.allowInvalidCert)}
                  onChange={(e) => updateEmail({ allowInvalidCert: e.target.checked })}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEmail}
                loading={emailSaving}
                disabled={!formValid || isTesting || removing}
              >
                Save email settings
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                leftIcon={<Send size={14} />}
                onClick={handleSendTest}
                loading={isTesting}
                disabled={!formValid || emailSaving || removing}
              >
                Send test email
              </Button>

              {meta.configured && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 size={14} />}
                  onClick={handleRemoveEmail}
                  loading={removing}
                  disabled={emailSaving || isTesting}
                >
                  Remove
                </Button>
              )}

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

            <p className="mt-3 text-xs text-ink-muted">
              The test email is sent to your own address
              {currentUser?.email ? ` (${currentUser.email})` : ""} using the
              values above, even before you save.
            </p>
          </>
        )}
      </SettingsCard>
    </div>
  );
}
