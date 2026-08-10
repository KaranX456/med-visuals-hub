import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { regulatoryItems } from "@/data/mock";

export const Route = createFileRoute("/admin/regulatory")({
  head: () => ({
    meta: [
      { title: "Regulatory Register — AI Health Companion" },
      { name: "description", content: "SaMD classification, disclosure-gate exception and liability scope tracked as open items." },
      { property: "og:title", content: "Regulatory Register — AI Health Companion" },
      { property: "og:description", content: "Regulatory posture designed in from the start, not bolted on." },
    ],
  }),
  component: Regulatory,
});

const tone: Record<string, string> = {
  high: "border-critical/40 bg-critical/10 text-critical",
  medium: "border-warning/40 bg-warning/10 text-warning",
  low: "border-success/40 bg-success/10 text-success",
};

function Regulatory() {
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Regulatory register"
        description="The doctor-facing decision support track carries materially higher regulatory risk than the patient wellness track. Both are tracked here explicitly."
      />
      <Section title="Open items">
        <div className="space-y-3">
          {regulatoryItems.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{r.status}</Badge>
                    <Badge variant="outline" className={tone[r.risk]}>
                      {r.risk} risk
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
      <SafetyNote>Not a medical device. No diagnostic claim is made anywhere in this product.</SafetyNote>
    </>
  );
}
