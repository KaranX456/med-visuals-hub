import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { labResults, medicalHistory, medications, patient, symptomEntries } from "@/data/mock";

export const Route = createFileRoute("/doctor/dossier")({
  head: () => ({
    meta: [
      { title: "Patient Dossier — Clinical Decision Support" },
      { name: "description", content: "Full patient-logged history in one view via patient-authorized secure local transfer." },
      { property: "og:title", content: "Patient Dossier — Clinical Decision Support" },
      { property: "og:description", content: "Symptoms, medications, labs and history consolidated for the visit." },
    ],
  }),
  component: Dossier,
});

function Dossier() {
  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 1"
        title={`${patient.name} · consolidated dossier`}
        description={`${patient.age} y/o ${patient.sex.toLowerCase()} · ${patient.region} · shared ${patient.lastSync} by secure local transfer (no central server).`}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Logged symptoms" value={String(symptomEntries.length)} tone="clinical" />
        <StatCard label="Active medications" value={String(medications.length)} />
        <StatCard label="Lab panels" value={String(labResults.length)} />
        <StatCard label="Documented allergies" value={String(medicalHistory.allergies.length)} tone="critical" />
      </div>

      <Section title="Symptom log">
        <div className="space-y-3">
          {symptomEntries.map((s) => (
            <Card key={s.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Onset {s.onset} · {s.frequency}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.notes}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-clinical/40 bg-clinical/10 text-clinical">
                  {s.severity}/10
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medications & adherence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {medications.map((m) => (
              <div key={m.id} className="flex justify-between gap-3">
                <span>
                  {m.name} {m.dose}
                </span>
                <span className="text-muted-foreground">{m.adherence}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-critical/40">
          <CardHeader>
            <CardTitle className="text-base text-critical">Allergies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {medicalHistory.allergies.map((a) => (
              <div key={a.name} className="flex justify-between gap-3">
                <span>
                  {a.name} — {a.reaction}
                </span>
                <span className="text-muted-foreground">{a.severity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SafetyNote>Patient-logged data. Verify clinically before acting on any element of this record.</SafetyNote>
    </>
  );
}