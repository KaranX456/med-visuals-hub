import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { pipelineHealth, sourceContributions } from "@/data/mock";

export const Route = createFileRoute("/admin/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline Health — AI Health Companion" },
      { name: "description", content: "Ingest, extraction and scoring services with latency and source contribution mix." },
      { property: "og:title", content: "Pipeline Health — AI Health Companion" },
      { property: "og:description", content: "Where the evidence comes from, and whether each stage is healthy." },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Pipeline health"
        description="Stage 1 hypothesis generation and Stage 2 scoring run as separate services. Degradation in one must never silently change the other's output."
      />

      <Section title="Services">
        <div className="space-y-3">
          {pipelineHealth.map((p) => (
            <Card key={p.name}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.latency} · {p.volume}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    p.status === "healthy"
                      ? "shrink-0 border-success/40 bg-success/10 text-success"
                      : "shrink-0 border-warning/40 bg-warning/10 text-warning"
                  }
                >
                  {p.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Evidence source mix" description="Share of probability mass contributed by each structured source.">
        <Card>
          <CardContent className="space-y-4 p-5">
            {sourceContributions.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-sm">
                  <span>{s.source}</span>
                  <span className="text-muted-foreground">{s.share}%</span>
                </div>
                <Progress value={s.share} className="mt-1.5 h-2" aria-label={`${s.source} contribution`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <SafetyNote>Community NLP contributes hypotheses only. It never appears in this probability mix.</SafetyNote>
    </>
  );
}
