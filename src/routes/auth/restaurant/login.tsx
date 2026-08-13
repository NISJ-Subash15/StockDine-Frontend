import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/routes/login";

export const Route = createFileRoute("/auth/restaurant/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockDine" },
      { name: "description", content: "Sign in to access your StockDine account." },
    ],
  }),
  component: LoginPage,
});
