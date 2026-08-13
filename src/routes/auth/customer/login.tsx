import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/routes/login";

export const Route = createFileRoute("/auth/customer/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockDine" },
      { name: "description", content: "Sign in using your Email Address or Mobile Number." },
    ],
  }),
  component: LoginPage,
});
