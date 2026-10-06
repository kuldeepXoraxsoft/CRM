import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Modal, Button, Input } from "../components/ui";
import { authApi } from "../api/Authapi";
import { useToast } from "../context/toastContext";

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setErrors({});
    setShowPassword(false);
    setLoading(false);
  }, [isOpen]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      general: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!form.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (form.newPassword.length < 8) {
      nextErrors.newPassword =
        "New password must be at least 8 characters long.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword =
        "New password and confirmation don't match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      setLoading(true);

      await authApi.changePassword(
        form.currentPassword,
        form.newPassword
      );

      success("Password updated successfully.");

      onClose();
    } catch (error) {
      error(
            err?.response?.data?.message ||
            "Failed to update password."
        );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {errors.general && (
          <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
            {errors.general}
          </div>
        )}

        {/* Current Password */}
        <div className="relative">
          <Input
            label="Current Password"
            required
            type={showPassword ? "text" : "password"}
            value={form.currentPassword}
            error={errors.currentPassword}
            onChange={(e) =>
              update("currentPassword", e.target.value)
            }
            className="pr-10"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="absolute right-3 top-[34px] flex items-center justify-center text-gray-400 hover:text-ink"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Input
            label="New Password"
            required
            type={showPassword ? "text" : "password"}
            value={form.newPassword}
            error={errors.newPassword}
            onChange={(e) =>
              update("newPassword", e.target.value)
            }
            className="pr-10"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="absolute right-3 top-[34px] flex items-center justify-center text-gray-400 hover:text-ink"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirm New Password"
            required
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) =>
              update("confirmPassword", e.target.value)
            }
            className="pr-10"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="absolute right-3 top-[34px] flex items-center justify-center text-gray-400 hover:text-ink"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}