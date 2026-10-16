import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, LogIn } from "lucide-react";

import { Button } from "./ui";
import { cn } from "../lib/cn";
import { useAuth } from "../context/AuthContext";

const TONES = {
  primary: {
    circle: "bg-primary-50 text-primary-500",
    code: "text-primary-500",
  },
  danger: {
    circle: "bg-danger-50 text-danger-500",
    code: "text-danger-500",
  },
};

/**
 * ErrorPage - shared layout for 404 / 403 pages.
 *
 * Props:
 * - code: "404" | "403" ...
 * - title, message: text
 * - icon: lucide icon component
 * - tone: 'primary' | 'danger'
 * - fullScreen: true  -> standalone page (404 catch-all)
 *               false -> sits inside the app Layout (Unauthorized)
 */
export default function ErrorPage({
  code,
  title,
  message,
  icon: Icon,
  tone = "primary",
  fullScreen = false,
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const colors = TONES[tone] ?? TONES.primary;

  const homePath = currentUser
    ? currentUser.role === "superAdmin"
      ? "/management"
      : "/dashboard"
    : "/";

  return (
    <div
      className={cn(
        "flex items-center justify-center px-6 text-center",
        fullScreen ? "min-h-screen bg-canvas" : "min-h-[70vh]"
      )}
      style={
        fullScreen
          ? {
              backgroundImage:
                "radial-gradient(circle at top right, rgba(12,124,114,0.12), transparent 38%), radial-gradient(circle at bottom left, rgba(12,124,114,0.06), transparent 32%)",
            }
          : undefined
      }
    >
      <div className="w-full max-w-md">
        <span
          className={cn(
            "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
            colors.circle
          )}
        >
          <Icon size={28} />
        </span>

        <p
          className={cn(
            "mt-6 text-7xl font-semibold tracking-tight",
            colors.code
          )}
        >
          {code}
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {message}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            leftIcon={currentUser ? <LayoutDashboard size={16} /> : <LogIn size={16} />}
            onClick={() => navigate(homePath, { replace: true })}
            className="w-full sm:w-auto"
          >
            {currentUser ? "Go to dashboard" : "Back to sign in"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}