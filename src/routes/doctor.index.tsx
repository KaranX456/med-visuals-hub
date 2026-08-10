import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSelectedPatient } from "@/lib/patient-context";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Today's List — Clinical Decision Support" },
      { name: "description", content: "Patients who have authorized a live record transfer to you." },
      { property: "og:title", content: "Today's List — Clinical Decision Support" },
      { property: "og:description", content: "Your clinic list with patient-authorized shared records." },
    ],
  }),
  component: DoctorHome,
});

function DoctorHome() {
  const { user } = useAuth();
  const { patients, selected, select, loading } = useSelectedPatient();

  return (
    <>
      <PageHeader
        eyebrow="Clinic"
        title="Today's list"
        description="Every patient here has actively granted you access. The list updates live as records are shared or revoked."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Shared records" value={String(patients.length)} hint="Live from care assignments" tone="clinical" />
        <StatCard label="Active patient" value={selected ? selected.fullName.split(" ")[0]! : "—"} hint="Used across all CDS screens" />
        <StatCard label="Your clinician ID" value={user ? "Ready to share" : "Sign in"} hint={user?.id.slice(0, 8) ?? ""} tone="hypothesis" />
      </div>

      <Section title="Patients">
        {loading ? <p className="text-sm text-muted-foreground">Loading your list…</p> : null}
        {!loading && !patients.length ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p>No patient has shared a record with you yet.</p>
              {user ? (
                <p>
                  Give a patient your clinician ID —{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{user.id}</code> — and ask
                  them to add it on their Doctor hand-off screen.
                </p>
              ) : (
                <p>
                  <Link to="/auth" className="font-medium text-primary underline">
                    Sign in
                  </Link>{" "}
                  as a clinician to see your list.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
        <div className="space-y-3">
          {patients.map((p) => (
            <Card key={p.patientId} className={p.patientId === selected?.patientId ? "border-primary/50" : undefined}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.region ?? "Region not set"}
                    {p.dateOfBirth ? ` · DOB ${p.dateOfBirth}` : ""}
                  </p>
                  {p.patientId === selected?.patientId ? (
                    <Badge variant="outline" className="mt-2 border-clinical/40 bg-clinical/10 text-clinical">
                      Active
                    </Badge>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost" onClick={() => select(p.patientId)}>
                    Set active
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/doctor/dossier" onClick={() => select(p.patientId)}>
                      Open dossier
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
      <SafetyNote>Decision support only. Nothing here is a diagnosis, and no action is taken automatically.</SafetyNote>
    </>
  );
}
