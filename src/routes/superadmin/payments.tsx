import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/superadmin/payments")({
  component: SuperAdminPaymentsSubroute,
});

function SuperAdminPaymentsSubroute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/superadmin", replace: true });
  }, [navigate]);

  return null;
}
