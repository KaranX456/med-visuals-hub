import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SelectedPatientProvider } from "@/lib/patient-context";

export const Route = createFileRoute("/doctor")({
  component: () => (
    <AppShell role="doctor">
      <SelectedPatientProvider>
        <Outlet />
      </SelectedPatientProvider>
    </AppShell>
  ),
});
