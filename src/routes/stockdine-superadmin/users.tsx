import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/stockdine-superadmin/users")({
  component: UsersSubRouteRedirect,
});

function UsersSubRouteRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/stockdine-superadmin", replace: true });
  }, [navigate]);

  return null;
}
