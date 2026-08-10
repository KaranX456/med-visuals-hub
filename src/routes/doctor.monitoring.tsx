import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoPatientNotice, PatientSwitcher, useSelectedPatient } from "@/lib/patient-context";
import { useMedications, useSymptoms, useTriageRecords } from "@/lib/clinical-data";

export const Route = createFileRoute("/doctor/monitoring")({
  head: () => ({
    meta: [
      { title: "Longitudinal Monitoring — Clinical Decision Support" },
      { name: "description", content: "Symptom burden and adherence over time, updating live between visits." },
      { property: "og:title", content: "Longitudinal Monitoring — Clinical Decision Support" },
      { property: "og:description", content: "Between-visit trends assembled from the patient's own logging." },
    ],
  }),
  component: Monitoring,
});

function Monitoring() {
  const { selected } = useSelectedPatient();
  const id = selected?.patientId;
  const { data: symptoms = [] } = useSymptoms(id);
  const { data: meds = [] } = useMedications(id);
  const { data: triage = [] } = useTriageRecords(id);

  const byDay = new Map<string, number>();
  for (const s of symptoms) {
    const day = (s.created_at ?? "").slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + (s.severity ?? 0));
  }
  const series = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, burden]) => ({ date, burden }));

  const adherence = meds.length
    ? Math.round(meds.reduce((acc, m) => acc + (m.adherence ?? 0), 0) / meds.length)
    : null;
  const escalations = triage.filter((t) => t.urgency === "emergency" || t.urgency === "same-day");

  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 4"
        title="Longitudinal monitoring"
        description="What happened between visits, drawn from the patient's own logging rather than recall at the appointment."
        actions={<PatientSwitcher />}
      />

      {!selected ? <NoPatientNotice /> : null}

      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Logged entries" value={String(symptoms.length)} tone="clinical" />
            <StatCard label="Mean adherence" value={adherence === null ? "—" : `${adherence}%`} />
            <StatCard label="Urgency escalations" value={String(escalations.length)} tone="warning" />
          </div>

          <Section title="Symptom burden over time" description="Sum of daily severity scores from the live log.">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="burden" name="Burden" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {!series.length ? <p className="text-sm text-muted-foreground">No logged symptoms yet.</p> : null}
              </CardContent>
            </Card>
          </Section>

          <Section title="Escalation events" description="Triage checks that routed to urgent care.">
            <div className="space-y-3">
              {escalations.length ? (
                escalations.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                      <div className="min-w-0">
                        <p className="font-medium">{t.summary ?? "Urgency check"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t.guidance}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-warning/40 bg-warning/10 text-warning">
                        {t.urgency}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No escalations recorded.</CardContent>
                </Card>
              )}
            </div>
          </Section>
        </>
      ) : null}

      <SafetyNote>Trends are self-reported. Corroborate clinically before changing management.</SafetyNote>
    </>
  );
}
