import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LifeBuoy } from "lucide-react";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { moodCheckIns } from "@/data/mock";

export const Route = createFileRoute("/patient/wellbeing")({
  head: () => ({
    meta: [
      { title: "Wellbeing Check-Ins — AI Health Companion" },
      { name: "description", content: "Open, non-diagnostic conversation with crisis escalation to real human resources." },
      { property: "og:title", content: "Wellbeing Check-Ins — AI Health Companion" },
      { property: "og:description", content: "Mood, sleep and energy patterns — never a self-applied mental health label." },
    ],
  }),
  component: Wellbeing,
});

function Wellbeing() {
  return (
    <>
      <PageHeader
        eyebrow="Patient feature 5"
        title="Wellbeing check-ins"
        description="An open conversation, not an assessment. When patterns warrant it, we suggest professional help — and we never apply a mental health label."
      />

      <Alert className="border-clinical/40 bg-clinical/5">
        <LifeBuoy className="size-4 text-clinical" aria-hidden />
        <AlertTitle>Support is always one tap away</AlertTitle>
        <AlertDescription>
          If you are in crisis, we escalate to real human resources — a local crisis line and your emergency
          contact — not to a chatbot.
        </AlertDescription>
      </Alert>

      <Section title="Your patterns" description="Mood, sleep and energy from your recent check-ins.">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodCheckIns} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="mood" name="Mood" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sleep" name="Sleep (h)" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="energy" name="Energy" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Today's check-in">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">How has today been?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="checkin" className="sr-only">
              Your check-in
            </Label>
            <Textarea id="checkin" rows={5} placeholder="Write as much or as little as you want…" />
            <Button onClick={() => toast.success("Check-in saved")}>Save check-in</Button>
            <SafetyNote>
              Your words stay on your device unless you share them. Sleep below five hours for several nights in a
              row, or a sharp drop in mood, will prompt a gentle suggestion to talk to someone qualified.
            </SafetyNote>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}