import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Checkbox } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

// Per-company deployment: set VITE_APP_NAME in .env (falls back to "CRM")
const APP_NAME = import.meta.env.VITE_APP_NAME || "CRM";

// Static preview of the lead pipeline shown on the left panel
const PIPELINE = [
  { stage: "New", count: 48, width: "100%" },
  { stage: "Contacted", count: 31, width: "68%" },
  { stage: "Proposal", count: 17, width: "40%" },
  { stage: "Won", count: 9, width: "22%" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const user = await login(form.email.trim(), form.password, form.remember);
      // SuperAdmin has no Leads/Accounts/Tasks of their own - land them
      // on the Management page instead of the regular Dashboard.
      navigate(user.role === "superAdmin" ? "/management" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* ============ LEFT PANEL ============ */}
      <aside className="login-brand">
        <div className="brand-row">
          <img src="/logo.svg" alt="" className="brand-logo" />
          <span className="brand-name">{APP_NAME}</span>
        </div>

        <div className="brand-copy">
          <p className="brand-kicker">Customer Relationship Platform</p>
          <h2 className="brand-heading">
            Manage leads, accounts and tasks in one place.
          </h2>
        </div>

        <div className="brand-showcase">
        <picture>
          <source srcSet="/login-showcase.webp" type="image/webp" />
          <img
            src="/login-showcase.png"
            alt="CRM dashboard showing leads, accounts and tasks"
            loading="eager"
            draggable={false}
          />
        </picture>
      </div>
      </aside>

      {/* ============ RIGHT PANEL ============ */}
      <main className="login-main">
        <div className="login-wrap">
          {/* Mobile logo */}
          <div className="brand-row brand-row-mobile">
            <img src="/logo.svg" alt="" className="brand-logo" />
            <span className="brand-name">{APP_NAME}</span>
          </div>

          <div className="login-card">
            <div className="login-head">
              <h1 className="login-title">Welcome back</h1>
              <p className="login-subtitle">
                Sign in to your {APP_NAME} workspace.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                value={form.email}
                leftIcon={<Mail size={18} />}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
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
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <div className="login-options">
                <Checkbox
                  label="Remember me"
                  checked={form.remember}
                  onChange={(e) => handleChange("remember", e.target.checked)}
                />
                <button type="button" className="forgot-btn">
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="login-footnote">Secure access to your {APP_NAME} workspace</p>
        </div>
      </main>
    </div>
  );
}