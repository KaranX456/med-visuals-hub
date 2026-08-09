import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleDot, Plus, Sparkles, Loader2 } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { communityThreads, prepQuestions, symptomEntries, symptomTrajectory } from "@/data/mock";
import { useAuth } from "@/hooks/use-auth";
import { addSymptom, useSymptoms } from "@/lib/clinical-data";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { runStage1Extraction } from "@/lib/clinical-engine.functions";

export const Route = createFileRoute("/patient/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptom Organizer — AI Health Companion" },
      { name: "description", content: "Guided symptom entry, a structured timeline and a pre-visit summary sheet." },
      { property: "og:title", content: "Symptom Organizer — AI Health Companion" },
      { property: "og:description", content: "Structure what you're feeling into something a doctor can use." },
    ],
  }),
  component: SymptomOrganizer,
});

function SymptomOrganizer() {
  const [severity, setSeverity] = useState([4]);
  const [name, setName] = useState("");
  const [onset, setOnset] = useState("2026-08-06");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: liveSymptoms } = useSymptoms();
  const extract = useServerFn(runStage1Extraction);
  const stage1 = useMutation({
    mutationFn: (text: string) => extract({ data: { text } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const entries = user
    ? (liveSymptoms ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        onset: s.onset ?? "—",
        severity: s.severity ?? 0,
        frequency: s.frequency ?? "Not specified",
        notes: s.notes ?? "",
        tags: s.tags ?? [],
      }))
    : symptomEntries;

  async function handleAdd() {
    if (!user) {
      toast.info("Sign in to save symptoms to your record", {
        description: "Without an account this stays a local demo.",
      });
      return;
    }
    if (!name.trim()) {
      toast.error("Give the symptom a name first");
      return;
    }
    setSaving(true);
    try {
      await addSymptom({
        patient_id: user.id,
        name: name.trim(),
        onset: onset || null,
        severity: severity[0] ?? 0,
        notes: notes.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["symptoms_log"] });
      setName("");
      setNotes("");
      toast.success("Symptom logged", { description: "Added to your timeline and pre-visit sheet." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that symptom");
    } finally {
      setSaving(false);
    }
  }

  const burden = symptomTrajectory.map((d) => ({
    date: d.date,
    total: d.sweats + d.fatigue + d.cough + d.headache,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Patient feature 1"
        title="Symptom organizer & pre-visit prep"
        description="Guided entry turns loose descriptions into a structured timeline, a summary sheet, and questions worth asking."
        actions={<StageTag stage={1} />}
      />

      <Tabs defaultValue="timeline">
        <TabsList className="flex-wrap">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="log">Log a symptom</TabsTrigger>
          <TabsTrigger value="summary">Pre-visit sheet</TabsTrigger>
          <TabsTrigger value="reading">Curated reading</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6 space-y-6">
          <Section title="Structured timeline" description="Ordered by onset, with the severity you recorded.">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Nothing logged yet. Use “Log a symptom” to start your timeline.
                </CardContent>
              </Card>
            ) : null}
            <ol className="relative space-y-4 border-l border-border pl-6">
              {entries.map((s) => (
                <li key={s.id} className="relative">
                  <CircleDot className="absolute -left-[31px] top-1 size-4 text-primary" aria-hidden />
                  <Card>
                    <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Onset {s.onset} · {s.frequency}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{s.notes}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.tags.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-clinical/40 bg-clinical/10 text-clinical">
                        {s.severity}/10
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Overall symptom burden" description="Sum of your daily severity scores.">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={burden} margin={{ left: -20, right: 8, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "var(--color-muted)" }}
                        contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="total" name="Burden" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="log" className="mt-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Guided entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="symptom-name">What are you feeling?</Label>
                <Input
                  id="symptom-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. night sweats, dull headache"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptom-onset">When did it start?</Label>
                <Input id="symptom-onset" type="date" value={onset} onChange={(e) => setOnset(e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label htmlFor="symptom-severity">How severe, 0 to 10? Currently {severity[0]}</Label>
                <Slider id="symptom-severity" value={severity} onValueChange={setSeverity} max={10} step={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptom-notes">Anything else worth noting?</Label>
                <Textarea
                  id="symptom-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Time of day, what makes it better or worse…"
                />
              </div>
              <Button onClick={handleAdd} disabled={saving}>
                <Plus className="size-4" aria-hidden /> Add to timeline
              </Button>
              <div className="space-y-3 rounded-xl border border-hypothesis/30 bg-hypothesis/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-hypothesis" aria-hidden /> Stage 1 — hypothesis extraction
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={stage1.isPending}
                    onClick={() => {
                      const text = `${name} ${notes}`.trim();
                      if (!text) {
                        toast.error("Describe the symptom first");
                        return;
                      }
                      stage1.mutate(text);
                    }}
                  >
                    {stage1.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    Extract concepts
                  </Button>
                </div>
                {stage1.data ? (
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">{stage1.data.narrative}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stage1.data.concepts.map((c) => (
                        <Badge
                          key={c.snomed}
                          variant="outline"
                          className={c.redFlag ? "border-critical/40 bg-critical/10 text-critical" : "border-hypothesis/40 bg-hypothesis/10 text-hypothesis"}
                        >
                          {c.concept} · SNOMED {c.snomed} · {Math.round(c.confidence * 100)}%
                        </Badge>
                      ))}
                    </div>
                    {stage1.data.negated.length ? (
                      <p className="text-xs text-muted-foreground">
                        Explicitly denied: {stage1.data.negated.join(", ")}
                      </p>
                    ) : null}
                    {stage1.data.duration || stage1.data.severity ? (
                      <p className="text-xs text-muted-foreground">
                        {stage1.data.duration ? `Duration ${stage1.data.duration.label} (${stage1.data.duration.chronicity}). ` : ""}
                        {stage1.data.severity ? `Severity cue: ${stage1.data.severity.label}.` : ""}
                      </p>
                    ) : null}
                    <ul className="space-y-2">
                      {stage1.data.hypotheses.map((h) => (
                        <li key={h.label} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-sm font-medium">{h.label}</p>
                          <p className="text-xs text-muted-foreground">{h.rationale}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Free text is mapped to coded clinical concepts, negation is stripped, and candidate hypotheses
                    are raised for Stage 2 scoring. Nothing here is a diagnosis.
                  </p>
                )}
              </div>
              <SafetyNote>
                What you log is structured into vocabulary the system understands. It generates candidate
                hypotheses for your doctor — it does not tell you what you have.
              </SafetyNote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pre-visit summary sheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Four symptoms logged over 21 days. Night sweats and fatigue are the most persistent; the dry cough
                began most recently. Two active long-term medications, one started 25 days ago.
              </p>
              <div>
                <h3 className="text-sm font-semibold">Questions to ask</h3>
                <ul className="mt-2 space-y-2">
                  {prepQuestions.map((q) => (
                    <li key={q} className="flex gap-2 text-muted-foreground">
                      <span aria-hidden className="text-primary">
                        —
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="outline" onClick={() => toast.success("Summary sheet ready to share")}>
                Export summary sheet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reading" className="mt-6 space-y-4">
          <SafetyNote>
            Curated reading is other people's <strong>lived experience</strong>, matched to your logged symptoms.
            It is perspective, not answers, and it never contributes to any probability.
          </SafetyNote>
          {communityThreads.map((t) => (
            <Card key={t.id} className="border-hypothesis/30">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-hypothesis/40 bg-hypothesis/10 text-hypothesis">
                    {t.subreddit}
                  </Badge>
                  <span className="text-xs text-muted-foreground">matched to {t.matchedSymptom}</span>
                </div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-muted-foreground">“{t.excerpt}”</p>
                <p className="text-xs text-muted-foreground">
                  {t.replies} replies · general tone: {t.sentiment}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}