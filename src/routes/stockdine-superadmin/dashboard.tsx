import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/stockdine-superadmin/dashboard")({
  component: SuperAdminDashboardRedirect,
});

function SuperAdminDashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/stockdine-superadmin", replace: true });
  }, [navigate]);

  return null;
}
