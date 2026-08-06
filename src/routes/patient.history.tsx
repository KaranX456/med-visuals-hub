import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon, HeartPulse, Scissors, Users2 } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { medicalHistory } from "@/data/mock";

export const Route = createFileRoute("/patient/history")({
  head: () => ({
    meta: [
      { title: "Medical History — AI Health Companion" },
      { name: "description", content: "Conditions, allergies, surgeries and family history — structured input to the scoring engine." },
      { property: "og:title", content: "Medical History — AI Health Companion" },
      { property: "og:description", content: "Fill it once, keep it current. Allergies run as a separate high-priority check." },
    ],
  }),
  component: History,
});

function History() {
  return (
    <>
      <PageHeader
        eyebrow="Structured input"
        title="Medical history"
        description="History serves three roles: an additional prior alongside geographic data, direct input to drug interaction flagging, and a separate high-priority allergy check."
        actions={<StageTag stage={2} />}
      />

      <Card className="border-critical/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-critical">
            <AlertOctagon className="size-5" aria-hidden /> Allergy register — high-priority check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {medicalHistory.allergies.map((a) => (
            <div key={a.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.name}</p>
                <p className="truncate text-sm text-muted-foreground">Reaction: {a.reaction}</p>
              </div>
              <Badge
                variant="outline"
                className={a.severity === "High" ? "border-critical/40 bg-critical/10 text-critical" : "border-warning/40 bg-warning/10 text-warning"}
              >
                {a.severity} severity
              </Badge>
            </div>
          ))}
          <SafetyNote>
            Missing a documented allergy is a different category of risk than a slightly-off diagnosis ranking, so
            this check runs independently of the ranking pipeline.
          </SafetyNote>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="size-4 text-primary" aria-hidden /> Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {medicalHistory.conditions.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2">
                <span>{c.name}</span>
                <span className="text-muted-foreground">
                  {c.status} · {c.since}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors className="size-4 text-primary" aria-hidden /> Surgeries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {medicalHistory.surgeries.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-2">
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.year}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users2 className="size-4 text-primary" aria-hidden /> Family history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {medicalHistory.family.map((f) => (
              <div key={f.relation} className="flex items-center justify-between gap-2">
                <span>{f.relation}</span>
                <span className="text-muted-foreground">{f.condition}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Section title="Add to your history" description="Three ingestion paths, same tiering as labs.">
        <Tabs defaultValue="form">
          <TabsList className="flex-wrap">
            <TabsTrigger value="form">Structured intake</TabsTrigger>
            <TabsTrigger value="fhir">FHIR import</TabsTrigger>
            <TabsTrigger value="text">Free-text</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-6">
            <Card className="max-w-2xl">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="cond">Condition or diagnosis</Label>
                  <Input id="cond" placeholder="e.g. asthma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="since">Since</Label>
                  <Input id="since" placeholder="Year" />
                </div>
                <Button onClick={() => toast.success("Added to your medical history")}>Save entry</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="text" className="mt-6">
            <Card className="max-w-2xl">
              <CardContent className="space-y-4 pt-6">
                <Label htmlFor="free">Describe your history in your own words</Label>
                <Textarea id="free" rows={6} placeholder="I had my appendix out in 2014, and I've been on metformin since last year…" />
                <SafetyNote>
                  This routes through an extraction layer that pulls structured facts about you. It does not
                  generate diagnostic hypotheses — that keeps it distinct from the community NLP layer.
                </SafetyNote>
                <Button onClick={() => toast.success("Extracted 3 structured facts for your review")}>Extract facts</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="fhir" className="mt-6">
            <Card className="max-w-2xl">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <Badge variant="outline">Longer-term</Badge>
                <p>
                  Direct import from an existing patient portal or EHR. Most robust path, but requires
                  institutional cooperation — not part of the first release.
                </p>
                <Button variant="outline" disabled>
                  Connect a portal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}