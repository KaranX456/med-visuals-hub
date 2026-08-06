import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Info } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag, TierBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { adherenceTrend, disclosureFindings, medications } from "@/data/mock";

export const Route = createFileRoute("/patient/medications")({
  head: () => ({
    meta: [
      { title: "Medication Companion — AI Health Companion" },
      { name: "description", content: "Adherence logging, timing guidance from drug labelling, and structured side-effect checking." },
      { property: "og:title", content: "Medication Companion — AI Health Companion" },
      { property: "og:description", content: "Track doses and check new symptoms against structured pharmacovigilance data." },
    ],
  }),
  component: MedicationCompanion;
});

function MedicationCompanion() {
  const [taken, setTaken] = useState<Record<string, boolean>>(
    Object.fromEntries(medications.map((m) => [m.id, m.takenToday])),
  );

  return (
    <>
      <PageHeader
        eyebrow="Patient feature 2"
        title="Medication companion"
        description="Reminders and logging, plus a structured side-effect check whenever a new symptom appears on a medication you already take."
        actions={<StageTag stage={2} />}
      />

      <Section title="Today's doses">
        <div className="grid gap-4 md:grid-cols-3">
          {medications.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{m.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {m.dose} · {m.schedule}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`taken-${m.id}`} className="text-sm">
                    Taken today
                  </Label>
                  <Switch
                    id={`taken-${m.id}`}
                    checked={taken[m.id]}
                    onCheckedChange={(v) => {
                      setTaken((p) => ({ ...p, [m.id]: v }));
                      toast.success(v ? `${m.name} logged` : `${m.name} marked not taken`);
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Adherence</span>
                    <span>{m.adherence}%</span>
                  </div>
                  <Progress value={m.adherence} className="mt-1.5 h-2" aria-label={`${m.name} adherence`} />
                </div>
                <p className="flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {m.timingGuidance}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Adherence trend" description="Weekly percentage of scheduled doses logged.">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adherenceTrend} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} unit="%" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="sertraline" name="Sertraline" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="metformin" name="Metformin" stroke="var(--color-chart-4)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Side-effect check"
        description="New symptoms cross-referenced against FAERS and DrugBank records for your active medications."
      >
        <Accordion type="single" collapsible className="space-y-3">
          {disclosureFindings.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="rounded-xl border border-border px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pr-2 text-left sm:flex sm:justify-between">
                  <span className="min-w-0 truncate font-medium">{f.symptom}</span>
                  <span className="flex shrink-0 flex-wrap items-center gap-2">
                    <TierBadge tier={f.tier} />
                    <Badge
                      variant="outline"
                      className={f.disclosed ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning"}
                    >
                      {f.disclosed ? "Explained" : "Urgency routing only"}
                    </Badge>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4 text-sm text-muted-foreground">
                <p>{f.plainLanguage}</p>
                <dl className="grid gap-2 sm:grid-cols-3">
                  <GateItem label="Well-established tier" pass={f.tier === "well-established"} />
                  <GateItem label="Direct structured link" pass={f.directLink} />
                  <GateItem label="Benign / reversible" pass={f.benign} />
                </dl>
                <SafetyNote>
                  <Info className="mr-1 inline size-3.5" aria-hidden />
                  {f.source}. All three gates must pass before a cause is named — otherwise you get urgency
                  guidance only.
                </SafetyNote>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button variant="outline" onClick={() => toast.info("Re-checked against the latest FAERS index")}>
          Re-run side-effect check
        </Button>
      </Section>
    </>
  );
}

function GateItem({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={pass ? "mt-1 text-sm font-semibold text-success" : "mt-1 text-sm font-semibold text-critical"}>
        {pass ? "Pass" : "Fail"}
      </dd>
    </div>
  );
}