import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowRight, Pill, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader, SafetyNote, Section, StatCard, UrgencyBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  disclosureFindings,
  medications,
  moodCheckIns,
  patient,
  symptomEntries,
  symptomTrajectory,
  triageAssessments,
} from "@/data/mock";

export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "Patient Overview — AI Health Companion" },
      { name: "description", content: "Your logged symptoms, medications, wellbeing trend and urgency guidance in one view." },
      { property: "og:title", content: "Patient Overview — AI Health Companion" },
      { property: "og:description", content: "Symptoms, medications, wellbeing and urgency guidance at a glance." },
    ],
  }),
  component: PatientOverview,
});

function PatientOverview() {
  const adherence = Math.round(medications.reduce((a, m) => a + m.adherence, 0) / medications.length);
  const topUrgency = triageAssessments.find((t) => t.urgency === "scheduled")!;
  const disclosed = disclosureFindings.filter((d) => d.disclosed);

  return (
    <>
      <PageHeader
        eyebrow={`${patient.name} · ${patient.age} · ${patient.region}`}
        title="Your health overview"
        description={`Last synced ${patient.lastSync}. Everything here is your own logged data — nothing is shared until you choose to share it.`}
        actions={
          <Button asChild>
            <Link to="/patient/handoff">
              Prepare hand-off <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active symptoms" value={String(symptomEntries.length)} hint="Logged in the last 21 days" icon={<Activity className="size-5" aria-hidden />} tone="clinical" />
        <StatCard label="Medication adherence" value={`${adherence}%`} hint="Across 3 active medications" icon={<Pill className="size-5" aria-hidden />} tone="success" />
        <StatCard label="Current guidance" value="Scheduled visit" hint="Within the next 7 days" icon={<ShieldCheck className="size-5" aria-hidden />} tone="warning" />
        <StatCard label="Explained findings" value={String(disclosed.length)} hint="Passed the disclosure gate" icon={<Sparkles className="size-5" aria-hidden />} tone="hypothesis" />
      </div>

      <Section
        title="Symptom trajectory"
        description="Severity you recorded, 0–10, over the last three weeks."
        aside={
          <Button asChild variant="outline" size="sm">
            <Link to="/patient/symptoms">Open organizer</Link>
          </Button>
        }
      >
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={symptomTrajectory} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gSweats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFatigue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="sweats" name="Night sweats" stroke="var(--color-chart-1)" fill="url(#gSweats)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fatigue" name="Fatigue" stroke="var(--color-chart-2)" fill="url(#gFatigue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cough" name="Dry cough" stroke="var(--color-chart-3)" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="headache" name="Headache" stroke="var(--color-chart-4)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="What we can explain" description="Only findings that are well-established, directly linked and benign are named.">
          <div className="space-y-3">
            {disclosed.map((d) => (
              <Card key={d.id} className="border-success/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{d.symptom}</CardTitle>
                  <Badge variant="outline" className="w-fit border-success/40 bg-success/10 text-success">
                    Explained in plain language
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{d.plainLanguage}</p>
                  <SafetyNote>Source: {d.source}</SafetyNote>
                </CardContent>
              </Card>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/patient/triage">See how urgency is decided</Link>
            </Button>
          </div>
        </Section>

        <Section title="Today's actions" description="Small things that keep your record useful.">
          <div className="space-y-3">
            {medications.map((m) => (
              <Card key={m.id}>
                <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {m.name} <span className="font-normal text-muted-foreground">{m.dose}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.schedule}</p>
                    <Progress value={m.adherence} className="mt-2 h-1.5" aria-label={`${m.name} adherence ${m.adherence}%`} />
                  </div>
                  <Badge variant="outline" className={m.takenToday ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning"}>
                    {m.takenToday ? "Taken" : "Due"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            <Card className="border-clinical/30">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <UrgencyBadge urgency={topUrgency.urgency} />
                  <span className="font-medium">{topUrgency.symptom}</span>
                </div>
                <p className="text-muted-foreground">{topUrgency.guidance}</p>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>

      <Section title="Mood and sleep" description="From your wellbeing check-ins. This is a conversation, not a diagnosis.">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodCheckIns} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="mood" name="Mood (1–7)" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="sleep" name="Sleep (hours)" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}