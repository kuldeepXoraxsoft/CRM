import { SearchX } from "lucide-react";
import ErrorPage from "../../components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      fullScreen
      tone="primary"
      icon={SearchX}
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or may have been moved. Check the URL or head back to a safe place."
    />
  );
}