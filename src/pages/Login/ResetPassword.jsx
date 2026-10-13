import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Button, Input } from "../../components/ui";
import { authApi } from "../../api/Authapi";
import AuthShell from "./AuthShell";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await authApi.resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please request a new link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // No token in the URL
  if (!token) {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link is missing or incomplete."
      >
        <div className="login-form">
          <Link to="/forgot-password" className="login-btn auth-btn-link">
            Request a new link
          </Link>
          <Link to="/" className="auth-back">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You can now sign in with your new password."
      >
        <div className="login-form">
          <p className="login-success" role="status">
            Redirecting you to the sign in page...
          </p>
          <Link to="/" className="login-btn auth-btn-link">
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="New password"
          autoComplete="new-password"
          autoFocus
          value={form.password}
          leftIcon={<Lock size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          helperText="At least 8 characters"
          onChange={(e) => handleChange("password", e.target.value)}
        />

        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm new password"
          autoComplete="new-password"
          value={form.confirm}
          leftIcon={<Lock size={18} />}
          onChange={(e) => handleChange("confirm", e.target.value)}
        />

        {error && (
          <p className="login-error" role="alert">
            {error}{" "}
            {/invalid|expired/i.test(error) && (
              <Link to="/forgot-password" className="auth-inline-link">
                Request a new link
              </Link>
            )}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="login-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Reset password"}
        </Button>

        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </form>
    </AuthShell>
  );
}