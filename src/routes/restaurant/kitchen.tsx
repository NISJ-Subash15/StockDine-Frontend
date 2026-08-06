import { createFileRoute } from "@tanstack/react-router";
import { KitchenPage } from "../kitchen";

export const Route = createFileRoute("/restaurant/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Terminal — StockDine" },
      { name: "description", content: "Kitchen Live Order Execution Terminal." },
    ],
  }),
  component: KitchenPage,
});
