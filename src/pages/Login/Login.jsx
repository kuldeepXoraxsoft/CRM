import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { Button, Input, Checkbox } from "../../components/ui";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    navigate("/dashboard")
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
            placeholder="Email"
            value={form.email}
            leftIcon={<Mail size={18} />}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
          />

          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            leftIcon={<Lock size={18} />}
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

          <Button
            type="submit"
            variant="primary"
            className="login-btn"
          >
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
}