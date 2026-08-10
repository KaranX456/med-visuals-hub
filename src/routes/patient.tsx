import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRealtimeClinicalSync } from "@/lib/clinical-data";

function PatientLayout() {
  useRealtimeClinicalSync();
  return (
    <AppShell role="patient">
      <Outlet />
    </AppShell>
  );
}

export const Route = createFileRoute("/patient")({
  component: PatientLayout,
});
