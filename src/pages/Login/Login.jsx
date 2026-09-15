import { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { Button, Input, Checkbox } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      // straight on the Management page (Departments + Admins) instead
      // of the regular Dashboard.
      navigate(user.role === "superAdmin" ? "/management" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative circles */}
      <div className="circle circle-one"></div>
      <div className="circle circle-two"></div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-icon">
          <LogIn size={30} />
        </div>

        <h1 className="login-title">
          Sign in with email
        </h1>

        <p className="login-subtitle">
          Manage your Leads and account with ease
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            leftIcon={<Mail size={18} />}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
            onChange={(e) =>
              handleChange("password", e.target.value)
            }
          />

          <div className="login-options">
            <Checkbox
              label="Remember me"
              checked={form.remember}
              onChange={(e) =>
                handleChange(
                  "remember",
                  e.target.checked
                )
              }
            />

            <button
              type="button"
              className="forgot-btn"
            >
              Forgot password?
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}