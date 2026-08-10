import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneCall, ShieldQuestion } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag, UrgencyBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Urgency } from "@/data/mock";
import { triageAssessments } from "@/data/mock";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { addTriageRecord, useTriageRecords } from "@/lib/clinical-data";

export const Route = createFileRoute("/patient/triage")({
  head: () => ({
    meta: [
      { title: "Urgency Guidance — AI Health Companion" },
      { name: "description", content: "Conservative routing: emergency, same-day care, scheduled visit, or monitor." },
      { property: "og:title", content: "Urgency Guidance — AI Health Companion" },
      { property: "og:description", content: "How urgent is this? Guidance without naming a condition." },
    ],
  }),
  component: Triage,
});

const questions = [
  {
    id: "q1",
    prompt: "Are you having difficulty breathing, chest pain, or severe bleeding right now?",
    options: [
      { value: "yes", label: "Yes", weight: 3 },
      { value: "no", label: "No", weight: 0 },
    ],
  },
  {
    id: "q2",
    prompt: "How long has this been going on?",
    options: [
      { value: "hours", label: "Hours", weight: 1 },
      { value: "days", label: "A few days", weight: 1 },
      { value: "weeks", label: "More than a week", weight: 2 },
    ],
  },
  {
    id: "q3",
    prompt: "Is it getting worse?",
    options: [
      { value: "worse", label: "Getting worse", weight: 2 },
      { value: "same", label: "About the same", weight: 1 },
      { value: "better", label: "Improving", weight: 0 },
    ],
  },
];

function routeFor(score: number): Urgency {
  if (score >= 3) return "emergency";
  if (score >= 4) return "same-day";
  if (score >= 2) return "scheduled";
  return "monitor";
}

function Triage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Urgency | null>(null);
  const { user } = useAuth();
  const { data: liveTriage } = useTriageRecords();

  const guidanceFor = (u: Urgency) =>
    u === "emergency"
      ? "Call emergency services now. Do not drive yourself."
      : u === "same-day"
        ? "Seek same-day care at a clinic today."
        : u === "scheduled"
          ? "Book a scheduled visit within the next 7 days."
          : "Keep monitoring and logging. Raise it at your next appointment.";

  const submit = async () => {
    const score = questions.reduce((acc, q) => {
      const chosen = q.options.find((o) => o.value === answers[q.id]);
      return acc + (chosen?.weight ?? 0);
    }, 0);
    const urgency = routeFor(score);
    setResult(urgency);
    if (!user) {
      toast.info("Sign in to save this routing to your record");
      return;
    }
    try {
      await addTriageRecord({
        patient_id: user.id,
        urgency,
        summary: `Urgency check — score ${score}`,
        guidance: guidanceFor(urgency),
        red_flags: answers["q1"] === "yes" ? ["Breathing / chest pain / bleeding reported"] : [],
      });
      toast.success("Guidance saved to your record");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that check");
    }
  };

  const records = user
    ? (liveTriage ?? []).map((t) => ({
        id: t.id,
        symptom: t.summary ?? "Urgency check",
        guidance: t.guidance ?? "",
        rationale: t.red_flags.length ? t.red_flags.join(", ") : "No red flags reported.",
        urgency: t.urgency as Urgency,
      }))
    : triageAssessments;

  return (
    <>
      <PageHeader
        eyebrow="Patient feature 8"
        title="Severity & urgency guidance"
        description="Conservative routing on how urgent something is — emergency, same-day, scheduled, or monitor. It targets both failure modes: wasted visits and underestimating something serious."
        actions={<StageTag stage={2} />}
      />

      <Alert className="border-critical/40 bg-critical/5">
        <PhoneCall className="size-4 text-critical" aria-hidden />
        <AlertTitle className="text-critical">If this is an emergency, do not use this screen</AlertTitle>
        <AlertDescription>
          Call your local emergency number now for chest pain, difficulty breathing, severe bleeding, sudden
          weakness, or loss of consciousness.
        </AlertDescription>
      </Alert>

      <Section title="Quick check" description="Three questions. We route to a level of care, never to a named condition.">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldQuestion className="size-4 text-primary" aria-hidden /> How urgent is this?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q) => (
              <fieldset key={q.id} className="space-y-3">
                <legend className="text-sm font-medium">{q.prompt}</legend>
                <RadioGroup
                  value={answers[q.id] ?? ""}
                  onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
                  className="gap-2"
                >
                  {q.options.map((o) => (
                    <div key={o.value} className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3">
                      <RadioGroupItem value={o.value} id={`${q.id}-${o.value}`} />
                      <Label htmlFor={`${q.id}-${o.value}`} className="flex-1 cursor-pointer py-2 font-normal">
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>
            ))}
            <Button onClick={() => void submit()} disabled={Object.keys(answers).length < questions.length}>
              Get guidance
            </Button>

            {result ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/50 p-4" role="status" aria-live="polite">
                <UrgencyBadge urgency={result} />
                <p className="text-sm text-foreground">
                  {result === "emergency"
                    ? "Call emergency services now. Do not drive yourself."
                    : result === "same-day"
                      ? "Seek same-day care at a clinic today."
                      : result === "scheduled"
                        ? "Book a scheduled visit within the next 7 days."
                        : "Keep monitoring and logging. Raise it at your next appointment."}
                </p>
                <SafetyNote>
                  Routing is deliberately conservative and never names a condition. If anything changes or
                  worsens, re-run this check.
                </SafetyNote>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </Section>

      <Section title="Recent guidance" description="Every routing decision, with the reason behind it.">
        <div className="space-y-3">
          {records.map((t) => (
            <Card key={t.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{t.symptom}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.guidance}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.rationale}</p>
                </div>
                <div className="shrink-0">
                  <UrgencyBadge urgency={t.urgency} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}