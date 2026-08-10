import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Lock } from "lucide-react";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NoPatientNotice, PatientSwitcher, useSelectedPatient } from "@/lib/patient-context";
import { useAuth } from "@/hooks/use-auth";
import {
  createSoapNote,
  updateSoapNote,
  useLabResults,
  useMedications,
  useSoapNotes,
  useSymptoms,
} from "@/lib/clinical-data";

export const Route = createFileRoute("/doctor/soap")({
  head: () => ({
    meta: [
      { title: "SOAP Note Assist — Clinical Decision Support" },
      { name: "description", content: "Draft, edit and sign SOAP notes from the patient's live logged record." },
      { property: "og:title", content: "SOAP Note Assist — Clinical Decision Support" },
      { property: "og:description", content: "A draft you edit and sign. The clinician owns every word." },
    ],
  }),
  component: SoapAssist,
});

const empty = { subjective: "", objective: "", assessment: "", plan: "" };

function SoapAssist() {
  const { user } = useAuth();
  const { selected } = useSelectedPatient();
  const id = selected?.patientId;
  const queryClient = useQueryClient();
  const { data: notes = [] } = useSoapNotes(id);
  const { data: symptoms = [] } = useSymptoms(id);
  const { data: meds = [] } = useMedications(id);
  const { data: labs = [] } = useLabResults(id);
  const [draft, setDraft] = useState(empty);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["soap_notes"] });

  const save = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error("Select a patient first");
      await createSoapNote({ patient_id: id, clinician_id: user.id, ...draft });
    },
    onSuccess: async () => {
      setDraft(empty);
      await refresh();
      toast.success("SOAP note saved", { description: "Visible to the patient immediately." });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sign = useMutation({
    mutationFn: (noteId: string) => updateSoapNote(noteId, { signed: true }),
    onSuccess: async () => {
      await refresh();
      toast.success("Note signed", { description: "Finalized and locked from further edits." });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function prefill() {
    const s = symptoms
      .map((x) => `${x.name} (severity ${x.severity ?? "?"}/10, onset ${x.onset ?? "unknown"})`)
      .join("; ");
    const o = labs.map((l) => `${l.analyte} ${l.value ?? "—"} ${l.unit ?? ""} ${l.status ?? ""}`.trim()).join("; ");
    const m = meds.map((x) => `${x.name} ${x.dose ?? ""} (${x.adherence ?? "—"}% adherence)`).join("; ");
    setDraft({
      subjective: s ? `Patient reports: ${s}.` : "",
      objective: [o ? `Labs: ${o}.` : "", m ? `Medications: ${m}.` : ""].filter(Boolean).join(" "),
      assessment: "",
      plan: "",
    });
    toast.success("Draft assembled from the live record");
  }

  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 5"
        title="SOAP note assist"
        description="The draft is assembled from what the patient logged. You edit it, and nothing is final until you sign."
        actions={<PatientSwitcher />}
      />

      {!selected ? <NoPatientNotice /> : null}

      {selected ? (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" aria-hidden /> New note
              </CardTitle>
              <Button size="sm" variant="outline" onClick={prefill}>
                Assemble draft
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="capitalize">
                    {field}
                  </Label>
                  <Textarea
                    id={field}
                    rows={field === "subjective" ? 4 : 3}
                    value={draft[field]}
                    onChange={(e) => setDraft((p) => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <Button disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Save note
              </Button>
              <SafetyNote>
                Auto-assembly is a time saver, not an author. Review every line — the signed note is your clinical
                record.
              </SafetyNote>
            </CardContent>
          </Card>

          <Section title="Notes for this patient" description="Signed notes are locked and sync live to the patient's record.">
            <div className="space-y-3">
              {notes.length ? (
                notes.map((n) => (
                  <Card key={n.id}>
                    <CardContent className="space-y-3 p-5 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">Visit {n.visit_date}</p>
                        <Badge
                          variant="outline"
                          className={
                            n.signed
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-warning/40 bg-warning/10 text-warning"
                          }
                        >
                          {n.signed ? "Signed" : "Draft"}
                        </Badge>
                      </div>
                      {(["subjective", "objective", "assessment", "plan"] as const).map((f) =>
                        n[f] ? (
                          <p key={f} className="text-muted-foreground">
                            <span className="font-semibold capitalize text-foreground">{f}: </span>
                            {n[f]}
                          </p>
                        ) : null,
                      )}
                      {!n.signed && n.clinician_id === user?.id ? (
                        <Button size="sm" disabled={sign.isPending} onClick={() => sign.mutate(n.id)}>
                          <Lock className="size-4" aria-hidden /> Sign & finalize
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No notes yet.</CardContent>
                </Card>
              )}
            </div>
          </Section>
        </>
      ) : null}
    </>
  );
}
