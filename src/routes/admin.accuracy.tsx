import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SafetyNote, Section, TierBadge } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllFeedback } from "@/lib/clinical-data";
import { accuracyByCategory, accuracyOverTime, literatureBenchmarks } from "@/data/mock";

export const Route = createFileRoute("/admin/accuracy")({
  head: () => ({
    meta: [
      { title: "Accuracy by Category — AI Health Companion" },
      { name: "description", content: "Top-1 and top-3 hit rates per condition category from confirmed outcomes." },
      { property: "og:title", content: "Accuracy by Category — AI Health Companion" },
      { property: "og:description", content: "Measured hit rates, tiered by condition category." },
    ],
  }),
  component: Accuracy,
});

function Accuracy() {
  const { data: feedback = [] } = useAllFeedback();

  const liveByCategory = [...new Set(feedback.map((f) => f.category ?? "Uncategorised"))].map((category) => {
    const rows = feedback.filter((f) => (f.category ?? "Uncategorised") === category);
    const top1 = rows.filter((f) => f.was_correct).length / rows.length;
    const top3 = rows.filter((f) => (f.suggestion_rank ?? 99) <= 3).length / rows.length;
    return { category, top1, top3, n: rows.length };
  });

  return (
    <>
      <PageHeader
        eyebrow="Validation"
        title="Accuracy by category"
        description="Live hit rates from the feedback loop, shown against the historical baseline. Categories are never averaged into one number."
      />

      <Section title="Live measured accuracy" description="Recomputed instantly on every confirmed outcome.">
        {liveByCategory.length ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveByCategory.map((c) => ({ ...c, top1: Math.round(c.top1 * 100), top3: Math.round(c.top3 * 100) }))} margin={{ left: -20, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis unit="%" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="top1" name="Top-1" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="top3" name="Top-3" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No confirmed outcomes yet — the historical baseline below is shown until the validation set fills.
            </CardContent>
          </Card>
        )}
      </Section>

      <Section title="Baseline validation set" description="Prior validation run, retained for comparison.">
        <div className="space-y-3">
          {accuracyByCategory.map((c) => (
            <Card key={c.category}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.category}</p>
                  <p className="text-xs text-muted-foreground">n = {c.n}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <TierBadge tier={c.tier} />
                  <span className="font-display text-lg font-semibold text-clinical">{Math.round(c.top1 * 100)}%</span>
                  <span className="text-sm text-muted-foreground">top-3 {Math.round(c.top3 * 100)}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Trend" description="Hit rate progression across validation runs.">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyOverTime.map((m) => ({ ...m, top1: Math.round(m.top1 * 100), top3: Math.round(m.top3 * 100) }))} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis unit="%" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="top1" name="Top-1" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="top3" name="Top-3" stroke="var(--color-chart-4)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Literature benchmarks" description="What comparable crowdsourced systems achieved.">
        <div className="grid gap-3 md:grid-cols-3">
          {literatureBenchmarks.map((b) => (
            <Card key={b.analog}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{b.analog}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p className="text-foreground">{b.finding}</p>
                <p className="text-xs">Caution: {b.caution}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <SafetyNote>Accuracy is a measured result on a defined dataset, never a marketing claim.</SafetyNote>
    </>
  );
}
