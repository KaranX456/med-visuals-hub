import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StageTag, TierBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { communityInsightsForDoctor, differential, treatmentOptions } from "@/data/mock";

export const Route = createFileRoute("/doctor/differential")({
  head: () => ({
    meta: [
      { title: "Ranked Differential — Clinical Decision Support" },
      { name: "description", content: "Stage 2 output: ranked candidates with a visible evidence trail and per-category confidence tiering." },
      { property: "og:title", content: "Ranked Differential — Clinical Decision Support" },
      { property: "og:description", content: "Evidence trail per candidate. Expand why before acting." },
    ],
  }),
  component: Differential,
});

function Differential() {
  return (
    <>
      <PageHeader
        eyebrow="Doctor feature 2"
        title="Ranked differential panel"
        description="Ranked candidates with the evidence trail that produced them. You must expand “why” before confirming — the tool assembles options, it does not decide."
        actions={<StageTag stage={2} />}
      />

      <Accordion type="single" collapsible className="space-y-3">
        {differential.map((c, i) => (
          <AccordionItem key={c.id} value={c.id} className="rounded-xl border border-border px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pr-2 text-left">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {i + 1}. {c.condition}
                  </p>
                  <p className="text-xs text-muted-foreground">ICD-10 {c.icd10}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <TierBadge tier={c.tier} />
                  <span className="font-display text-lg font-semibold text-clinical">
                    {Math.round(c.probability * 100)}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <Progress value={c.probability * 100} className="h-2" aria-label={`${c.condition} ranked probability`} />
              <p className="text-sm text-muted-foreground">{c.why}</p>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Evidence trail</h3>
                {c.evidence.map((e) => (
                  <div key={e.source + e.detail} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{e.source}</p>
                      <p className="text-xs text-muted-foreground">{e.detail}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {e.kind} · {e.contribution > 0 ? "+" : ""}
                      {Math.round(e.contribution * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={() => toast.success(`${c.condition} confirmed`, { description: "Recorded in the validation set." })}>
                Confirm this diagnosis
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Section title="Treatment options on confirmation" description="Assembled from structured knowledge. Never auto-prescribed.">
        <div className="grid gap-3 md:grid-cols-3">
          {treatmentOptions.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.drug}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p className="text-foreground">{t.dosing}</p>
                <p>{t.guideline}</p>
                <p className="text-xs">{t.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Community contextual insights" description="Separate and clearly labelled — never mixed into the clinical evidence trail.">
        <div className="space-y-3">
          {communityInsightsForDoctor.map((c) => (
            <Card key={c.id} className="border-hypothesis/30">
              <CardContent className="space-y-2 p-4">
                <Badge variant="outline" className="border-hypothesis/40 bg-hypothesis/10 text-hypothesis">
                  Lived experience · not scored
                </Badge>
                <p className="font-medium">{c.pattern}</p>
                <p className="text-xs text-muted-foreground">
                  {c.volume} posts · {c.subreddits.join(", ")} — {c.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <SafetyNote>Never a single flat diagnosis or a bare percentage. Confidence is tiered per condition category.</SafetyNote>
    </>
  );
}