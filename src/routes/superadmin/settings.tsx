import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/superadmin/settings")({
  component: SuperAdminSettingsSubroute,
});

function SuperAdminSettingsSubroute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/superadmin", replace: true });
  }, [navigate]);

  return null;
}
