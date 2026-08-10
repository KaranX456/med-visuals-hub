import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRealtimeFeedbackSync } from "@/lib/clinical-data";

function AdminLayout() {
  useRealtimeFeedbackSync();
  return (
    <AppShell role="admin">
      <Outlet />
    </AppShell>
  );
}

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});
