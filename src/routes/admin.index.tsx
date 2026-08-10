import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAllFeedback } from "@/lib/clinical-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Validation Overview — AI Health Companion" },
      { name: "description", content: "Live measured accuracy from confirmed clinical outcomes, not claimed accuracy." },
      { property: "og:title", content: "Validation Overview — AI Health Companion" },
      { property: "og:description", content: "Accuracy is a measured result on a defined validation dataset." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { user, hasRole } = useAuth();
  const { data: feedback = [], isLoading } = useAllFeedback();

  const hits = feedback.filter((f) => f.was_correct).length;
  const top3 = feedback.filter((f) => (f.suggestion_rank ?? 99) <= 3).length;

  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Validation overview"
        description="Every number here comes from clinician-confirmed outcomes streaming in from the feedback loop. Nothing is estimated."
      />

      {!user ? (
        <SafetyNote>Sign in with an admin account to see the full validation stream.</SafetyNote>
      ) : !hasRole("admin") ? (
        <SafetyNote>You are seeing only outcomes you are authorized to read. Admin accounts see the whole set.</SafetyNote>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Confirmed outcomes" value={String(feedback.length)} tone="clinical" hint="Live validation set" />
        <StatCard label="Top-1 hit rate" value={feedback.length ? `${Math.round((hits / feedback.length) * 100)}%` : "—"} />
        <StatCard label="Top-3 hit rate" value={feedback.length ? `${Math.round((top3 / feedback.length) * 100)}%` : "—"} tone="hypothesis" />
        <StatCard label="Misses" value={String(feedback.length - hits)} tone="critical" />
      </div>

      <Section title="Latest confirmations" description="Streaming live as clinicians close the loop.">
        <div className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!isLoading && !feedback.length ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No outcomes recorded yet. They appear here the instant a clinician confirms one.
              </CardContent>
            </Card>
          ) : null}
          {feedback.slice(0, 12).map((f) => (
            <Card key={f.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {f.suggested_condition} → {f.confirmed_condition}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.category ?? "uncategorised"} · rank {f.suggestion_rank ?? "—"} ·{" "}
                    {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    f.was_correct
                      ? "shrink-0 border-success/40 bg-success/10 text-success"
                      : "shrink-0 border-critical/40 bg-critical/10 text-critical"
                  }
                >
                  {f.was_correct ? "Hit" : "Miss"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <SafetyNote>Accuracy is reported per condition category. A single global percentage would be misleading.</SafetyNote>
    </>
  );
}
