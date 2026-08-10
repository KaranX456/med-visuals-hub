import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { NoPatientNotice, PatientSwitcher, useSelectedPatient } from "@/lib/patient-context";
import { useAuth } from "@/hooks/use-auth";
import { addFeedback, usePatientFeedback } from "@/lib/clinical-data";

export const Route = createFileRoute("/doctor/feedback")({
  head: () => ({
    meta: [
      { title: "Diagnosis Feedback Loop — Clinical Decision Support" },
      { name: "description", content: "Confirm the real outcome so ranking accuracy is measured, not assumed." },
      { property: "og:title", content: "Diagnosis Feedback Loop — Clinical Decision Support" },
      { property: "og:description", content: "Confirmed outcomes feed the validation set in real time." },
    ],
  }),
  component: FeedbackLoop,
});

const categories = ["Drug side effects", "Common infections", "Dermatology (photo)", "Metabolic / endocrine", "Rare / contested"];

function FeedbackLoop() {
  const { user } = useAuth();
  const { selected } = useSelectedPatient();
  const queryClient = useQueryClient();
  const { data: entries = [] } = usePatientFeedback(selected?.patientId);
  const [suggested, setSuggested] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [rank, setRank] = useState("1");
  const [category, setCategory] = useState(categories[0]!);
  const [notes, setNotes] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!selected || !user) throw new Error("Select a patient first");
      if (!suggested.trim() || !confirmed.trim()) throw new Error("Both the suggestion and the outcome are required");
      await addFeedback({
        patient_id: selected.patientId,
        clinician_id: user.id,
        suggested_condition: suggested.trim(),
        confirmed_condition: confirmed.trim(),
        suggestion_rank: Number(rank) || null,
        was_correct: suggested.trim().toLowerCase() === confirmed.trim().toLowerCase(),
        category,
        notes: notes.trim() || null,
      });
    },
    onSuccess: async () => {
      setSuggested("");
      setConfirmed("");
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: ["model_feedback"] });
      toast.success("Outcome recorded", { description: "Accuracy dashboards update immediately." });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hits = entries.filter((e) => e.was_correct).length;

  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 6"
        title="Diagnosis feedback loop"
        description="Confirmed outcomes are the only honest measure of whether the ranking helped. Every entry lands in the validation set the moment you save it."
        actions={<PatientSwitcher />}
      />

      {!selected ? <NoPatientNotice /> : null}

      {selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Recorded outcomes" value={String(entries.length)} tone="clinical" />
            <StatCard label="Top suggestion correct" value={String(hits)} tone="hypothesis" />
            <StatCard
              label="Hit rate"
              value={entries.length ? `${Math.round((hits / entries.length) * 100)}%` : "—"}
              hint="This patient only"
            />
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-primary" aria-hidden /> Confirm an outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suggested">Suggested condition (from the differential)</Label>
                <Input id="suggested" value={suggested} onChange={(e) => setSuggested(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmed">Confirmed clinical outcome</Label>
                <Input id="confirmed" value={confirmed} onChange={(e) => setConfirmed(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank of the suggestion</Label>
                  <Input id="rank" type="number" min={1} max={20} value={rank} onChange={(e) => setRank(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Condition category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fnotes">Notes</Label>
                <Textarea id="fnotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button disabled={submit.isPending} onClick={() => submit.mutate()}>
                {submit.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Record outcome
              </Button>
            </CardContent>
          </Card>

          <Section title="Recorded outcomes" description="Live stream for this patient.">
            <div className="space-y-3">
              {entries.length ? (
                entries.map((e) => (
                  <Card key={e.id}>
                    <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {e.suggested_condition} → {e.confirmed_condition}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rank {e.suggestion_rank ?? "—"} · {e.category ?? "uncategorised"}
                        </p>
                        {e.notes ? <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p> : null}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          e.was_correct
                            ? "shrink-0 border-success/40 bg-success/10 text-success"
                            : "shrink-0 border-critical/40 bg-critical/10 text-critical"
                        }
                      >
                        {e.was_correct ? "Hit" : "Miss"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No outcomes recorded yet.</CardContent>
                </Card>
              )}
            </div>
          </Section>
        </>
      ) : null}

      <SafetyNote>Misses matter more than hits. Nothing here is hidden from the accuracy dashboards.</SafetyNote>
    </>
  );
}
