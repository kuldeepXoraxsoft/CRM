import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

import { Button, Input } from "../../components/ui";
import { authApi } from "../../api/Authapi";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = email.trim();
    if (!value) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await authApi.forgotPassword(value);
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If that email is registered, we've sent a password reset link."
      >
        <div className="login-form">
          <p className="login-success" role="status">
            The link expires in 30 minutes. Don't forget to check your spam folder.
          </p>

          <Button
            type="button"
            variant="primary"
            className="login-btn"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Use a different email
          </Button>

          <Link to="/" className="auth-back">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          value={email}
          leftIcon={<Mail size={18} />}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
        />

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
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>

        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </form>
    </AuthShell>
  );
}