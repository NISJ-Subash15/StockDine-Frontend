import { createFileRoute } from "@tanstack/react-router";
import { StockDineSuperAdminPage } from "@/routes/stockdine-superadmin";

export const Route = createFileRoute("/superadmin")({
  head: () => ({
    meta: [
      { title: "Super Admin Portal — StockDine OS" },
      { name: "description", content: "Super Admin Platform Administration for StockDine." },
    ],
  }),
  component: StockDineSuperAdminPage,
});
