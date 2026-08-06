import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../admin";

export const Route = createFileRoute("/restaurant/admin")({
  head: () => ({
    meta: [
      { title: "Restaurant Admin — StockDine" },
      { name: "description", content: "Restaurant Management Dashboard." },
    ],
  }),
  component: AdminPage,
});
