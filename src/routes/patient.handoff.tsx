import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { prepQuestions } from "@/data/mock";

export const Route = createFileRoute("/patient/handoff")({
  head: () => ({
    meta: [
      { title: "Doctor Hand-Off — AI Health Companion" },
      { name: "description", content: "One-tap share of your full log at appointment time, by secure local transfer." },
      { property: "og:title", content: "Doctor Hand-Off — AI Health Companion" },
      { property: "og:description", content: "You choose what is shared, and when." },
    ],
  }),
  component: Handoff,
});

const bundles = [
  { id: "b1", label: "Symptom timeline (21 days)" },
  { id: "b2", label: "Medications and adherence" },
  { id: "b3", label: "Lab results and history" },
  { id: "b4", label: "Mood and sleep trends" },
];

function Handoff() {
  return (
    <>
      <PageHeader
        eyebrow="Patient feature 7"
        title="Doctor hand-off"
        description="One tap shares your log at appointment time. Transfer is patient-authorized and local — there is no central server holding your record."
      />
      <Section title="What to share">
        <Card className="max-w-2xl">
          <CardContent className="space-y-4 pt-6">
            {bundles.map((b) => (
              <div key={b.id} className="flex min-h-11 items-center gap-3">
                <Checkbox id={b.id} defaultChecked />
                <Label htmlFor={b.id} className="font-normal">
                  {b.label}
                </Label>
              </div>
            ))}
            <Button onClick={() => toast.success("Hand-off ready", { description: "Show the QR code to your clinician." })}>
              <Share2 className="size-4" aria-hidden /> Share with my doctor
            </Button>
            <SafetyNote>Sharing expires automatically at the end of your appointment window.</SafetyNote>
          </CardContent>
        </Card>
      </Section>
      <Section title="Questions included" description="Generated from your logged symptoms and history.">
        <Card>
          <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
            {prepQuestions.map((q) => (
              <p key={q}>— {q}</p>
            ))}
          </CardContent>
        </Card>
      </Section>
    </>
  );
}