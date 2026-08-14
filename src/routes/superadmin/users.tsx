import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/superadmin/users")({
  component: SuperAdminUsersSubroute,
});

function SuperAdminUsersSubroute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/superadmin", replace: true });
  }, [navigate]);

  return null;
}
