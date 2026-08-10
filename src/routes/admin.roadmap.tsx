import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { openNextSteps } from "@/data/mock";

export const Route = createFileRoute("/admin/roadmap")({
  head: () => ({
    meta: [
      { title: "Open Next Steps — AI Health Companion" },
      { name: "description", content: "What is decided, what is still open, and what gates the first release." },
      { property: "og:title", content: "Open Next Steps — AI Health Companion" },
      { property: "og:description", content: "The honest state of the build, item by item." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  return (
    <>
      <PageHeader
        eyebrow="Planning"
        title="Open next steps"
        description="Scope decisions still in play, including which track ships first."
      />
      <Section title="Checklist">
        <Card>
          <CardContent className="space-y-3 p-5">
            {openNextSteps.map((s) => (
              <div key={s.id} className="flex gap-3 text-sm">
                {s.done ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>
      <SafetyNote>The patient wellness and triage track is the lower-risk candidate for the first release.</SafetyNote>
    </>
  );
}
