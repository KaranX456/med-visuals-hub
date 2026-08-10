import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoPatientNotice, PatientSwitcher, useSelectedPatient } from "@/lib/patient-context";
import { useLabResults, useMedicalHistory, useMedications, useSymptoms, useTriageRecords } from "@/lib/clinical-data";

export const Route = createFileRoute("/doctor/dossier")({
  head: () => ({
    meta: [
      { title: "Patient Dossier — Clinical Decision Support" },
      { name: "description", content: "Patient-authorized clinical record, consolidated and updating live." },
      { property: "og:title", content: "Patient Dossier — Clinical Decision Support" },
      { property: "og:description", content: "Symptoms, medications, labs and history consolidated for the visit." },
    ],
  }),
  component: Dossier,
});

function Dossier() {
  const { selected } = useSelectedPatient();
  const id = selected?.patientId;
  const { data: symptoms = [] } = useSymptoms(id);
  const { data: meds = [] } = useMedications(id);
  const { data: labs = [] } = useLabResults(id);
  const { data: history = [] } = useMedicalHistory(id);
  const { data: triage = [] } = useTriageRecords(id);

  const allergies = history.filter((h) => h.kind === "allergy");

  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 1"
        title={selected ? `${selected.fullName} · consolidated dossier` : "Consolidated dossier"}
        description="Everything the patient authorized, in one view. Updates arrive live as they log new entries."
        actions={<PatientSwitcher />}
      />

      {!selected ? <NoPatientNotice /> : null}

      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Logged symptoms" value={String(symptoms.length)} tone="clinical" />
            <StatCard label="Medications" value={String(meds.length)} />
            <StatCard label="Lab values" value={String(labs.length)} />
            <StatCard label="Documented allergies" value={String(allergies.length)} tone="critical" />
          </div>

          <Section title="Symptom log">
            {symptoms.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Nothing logged yet.</CardContent>
              </Card>
            ) : null}
            <div className="space-y-3">
              {symptoms.map((s) => (
                <Card key={s.id}>
                  <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Onset {s.onset ?? "—"} · {s.frequency ?? "frequency not specified"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.notes}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-clinical/40 bg-clinical/10 text-clinical">
                      {s.severity ?? 0}/10
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
                {meds.length ? (
                  meds.map((m) => (
                    <div key={m.id} className="flex justify-between gap-3">
                      <span>
                        {m.name} {m.dose ?? ""}
                      </span>
                      <span className="text-muted-foreground">{m.adherence ?? "—"}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No medications shared.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-critical/40">
              <CardHeader>
                <CardTitle className="text-base text-critical">Allergies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {allergies.length ? (
                  allergies.map((a) => (
                    <div key={a.id} className="flex justify-between gap-3">
                      <span>
                        {a.label}
                        {a.detail ? ` — ${a.detail}` : ""}
                      </span>
                      <span className="text-muted-foreground">{a.severity ?? "unspecified"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">None documented.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Section title="Recent labs">
            <Card>
              <CardContent className="space-y-2 p-5 text-sm">
                {labs.length ? (
                  labs.map((l) => (
                    <div key={l.id} className="flex justify-between gap-3">
                      <span>
                        {l.panel} · {l.analyte}
                      </span>
                      <span className="text-muted-foreground">
                        {l.value ?? "—"} {l.unit ?? ""} {l.status ? `(${l.status})` : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No lab values shared.</p>
                )}
              </CardContent>
            </Card>
          </Section>

          <Section title="Urgency history" description="Every triage routing the patient recorded.">
            <div className="space-y-3">
              {triage.length ? (
                triage.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                      <div className="min-w-0">
                        <p className="font-medium">{t.summary ?? "Urgency check"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t.guidance}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {t.urgency}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No triage records yet.</CardContent>
                </Card>
              )}
            </div>
          </Section>
        </>
      ) : null}

      <SafetyNote>Patient-logged data. Verify clinically before acting on any element of this record.</SafetyNote>
    </>
  );
}
