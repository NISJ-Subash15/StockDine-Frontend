import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/stockdine-superadmin/reviews")({
  component: ReviewsSubRouteRedirect,
});

function ReviewsSubRouteRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/stockdine-superadmin", replace: true });
  }, [navigate]);

  return null;
}
