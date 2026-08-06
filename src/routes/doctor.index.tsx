import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { doctorQueue } from "@/data/mock";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Today's List — Clinical Decision Support" },
      { name: "description", content: "Scheduled patients with shared logs, flags and risk context." },
      { property: "og:title", content: "Today's List — Clinical Decision Support" },
      { property: "og:description", content: "Your clinic list with patient-authorized shared records." },
    ],
  }),
  component: DoctorHome,
});

function DoctorHome() {
  return (
    <>
      <PageHeader eyebrow="Clinic" title="Today's list" description="Four appointments. Three patients have authorized a record transfer." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Appointments" value="4" hint="09:30 – 11:45" tone="clinical" />
        <StatCard label="Open flags" value="3" hint="1 high severity" tone="warning" />
        <StatCard label="Awaiting outcome confirmation" value="2" hint="Feeds the validation set" tone="hypothesis" />
      </div>
      <Section title="Patients">
        <div className="space-y-3">
          {doctorQueue.map((p) => (
            <Card key={p.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {p.slot} · {p.name} <span className="font-normal text-muted-foreground">({p.age})</span>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{p.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.flags.map((f) => (
                      <Badge key={f} variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                        {f}
                      </Badge>
                    ))}
                    {!p.shared ? <Badge variant="secondary">No shared record</Badge> : null}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link to="/doctor/dossier">Open dossier</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
      <SafetyNote>Decision support only. Nothing here is a diagnosis, and no action is taken automatically.</SafetyNote>
    </>
  );
}