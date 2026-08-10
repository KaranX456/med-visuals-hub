import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PageHeader, SafetyNote, Section, TierBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NoPatientNotice, PatientSwitcher, useSelectedPatient } from "@/lib/patient-context";
import { useMedicalHistory, useMedications, useSymptoms } from "@/lib/clinical-data";
import { runDisclosureGate } from "@/lib/clinical-engine.functions";

export const Route = createFileRoute("/doctor/flags")({
  head: () => ({
    meta: [
      { title: "Interaction & Allergy Flags — Clinical Decision Support" },
      { name: "description", content: "Allergy conflicts and drug-symptom signals checked against the patient's live record." },
      { property: "og:title", content: "Interaction & Allergy Flags — Clinical Decision Support" },
      { property: "og:description", content: "Allergy checks run independently of the ranking pipeline." },
    ],
  }),
  component: Flags,
});

function Flags() {
  const { selected } = useSelectedPatient();
  const id = selected?.patientId;
  const { data: history = [] } = useMedicalHistory(id);
  const { data: meds = [] } = useMedications(id);
  const { data: symptoms = [] } = useSymptoms(id);
  const gate = useServerFn(runDisclosureGate);

  const check = useMutation({
    mutationFn: () =>
      gate({
        data: {
          symptoms: symptoms.map((s) => s.name).slice(0, 30),
          medications: meds.map((m) => m.name).slice(0, 30),
        },
      }),
    onSuccess: (r) => toast.success(`${r.findings.length} symptom-medication pairs evaluated`),
    onError: (e: Error) => toast.error(e.message),
  });

  const allergies = history.filter((h) => h.kind === "allergy");
  const findings = check.data?.findings ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 3"
        title="Interaction & allergy flags"
        description="Allergy conflicts run as a separate high-priority check — a missed allergy is a different category of risk than an imperfect ranking."
        actions={<PatientSwitcher />}
      />

      {!selected ? <NoPatientNotice /> : null}

      {selected ? (
        <>
          <Card className="border-critical/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-critical">
                <AlertTriangle className="size-5" aria-hidden /> Allergy register
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {allergies.length ? (
                allergies.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.label}</p>
                      <p className="truncate text-muted-foreground">{a.detail ?? "No reaction detail recorded"}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-critical/40 bg-critical/10 text-critical">
                      {a.severity ?? "unspecified"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No allergies documented by this patient.</p>
              )}
            </CardContent>
          </Card>

          <Section
            title="Drug-symptom signals"
            description="Live symptoms cross-referenced against pharmacovigilance records for the patient's active medications."
          >
            <Button variant="outline" disabled={check.isPending || !meds.length} onClick={() => check.mutate()}>
              {check.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Run interaction check
            </Button>
            <div className="mt-4 space-y-3">
              {findings.map((f) => (
                <Card key={f.id}>
                  <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{f.symptom}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{f.plainLanguage}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{f.source}</p>
                    </div>
                    <div className="shrink-0">
                      <TierBadge tier={f.tier ?? "rare-contested"} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!findings.length ? (
                <p className="text-sm text-muted-foreground">
                  {meds.length ? "Run the check to evaluate the current record." : "No medications shared yet."}
                </p>
              ) : null}
            </div>
          </Section>
        </>
      ) : null}

      <SafetyNote>Flags surface a conflict for you to resolve. Nothing is blocked or prescribed automatically.</SafetyNote>
    </>
  );
}
