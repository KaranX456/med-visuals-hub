import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, StageTag } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { communityThreads } from "@/data/mock";

export const Route = createFileRoute("/patient/community")({
  head: () => ({
    meta: [
      { title: "Community Perspective — AI Health Companion" },
      { name: "description", content: "Curated peer discussions matched to your logged symptoms, clearly labelled as lived experience." },
      { property: "og:title", content: "Community Perspective — AI Health Companion" },
      { property: "og:description", content: "Other people's experience — perspective, never answers." },
    ],
  }),
  component: Community,
});

function Community() {
  return (
    <>
      <PageHeader
        eyebrow="Patient feature 6"
        title="Community connection"
        description="Peer discussions matched to what you've logged. This is lived experience — it generates questions, not conclusions."
        actions={<StageTag stage={1} />}
      />
      <SafetyNote>
        Community content is a hypothesis-generation layer only. It never contributes to any probability and it is
        never mixed into clinical evidence.
      </SafetyNote>
      <div className="grid gap-4 md:grid-cols-2">
        {communityThreads.map((t) => (
          <Card key={t.id} className="border-hypothesis/30">
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-hypothesis/40 bg-hypothesis/10 text-hypothesis">
                  {t.subreddit}
                </Badge>
                <Badge variant="secondary">{t.matchedSymptom}</Badge>
              </div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-sm text-muted-foreground">“{t.excerpt}”</p>
              <p className="text-xs text-muted-foreground">
                {t.replies} replies · {t.sentiment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}