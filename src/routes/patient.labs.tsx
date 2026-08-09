import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Camera, FileUp, PencilLine } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { SecureUpload } from "@/components/secure-upload";
import { hba1cTrend, labResults } from "@/data/mock";

export const Route = createFileRoute("/patient/labs")({
  head: () => ({
    meta: [
      { title: "Lab Results — AI Health Companion" },
      { name: "description", content: "Review and correct lab values before they feed the structured scoring engine." },
      { property: "og:title", content: "Lab Results — AI Health Companion" },
      { property: "og:description", content: "Manual entry, OCR review, and FHIR import paths for lab data." },
    ],
  }),
  component: Labs,
});

const ingestion = [
  { step: 1, path: "Manual entry", note: "Simplest, available now", icon: PencilLine, status: "Available" },
  { step: 2, path: "Photo + on-device OCR", note: "Review-and-correct step before use", icon: Camera, status: "Available" },
  { step: 3, path: "Direct HL7 FHIR import", note: "Needs institutional cooperation", icon: FileUp, status: "Planned" },
];

function pct(v: number, low: number, high: number) {
  const span = high - low;
  return Math.max(0, Math.min(100, ((v - (low - span * 0.3)) / (span * 1.6)) * 100));
}

function Labs() {
  return (
    <>
      <PageHeader
        eyebrow="Structured input"
        title="Lab results"
        description="Lab values bypass the hypothesis layer entirely and go straight into the structured scoring engine — they are already precise data."
        actions={<StageTag stage={2} />}
      />

      <Section title="How results get in" description="Three ingestion paths, tiered by robustness.">
        <div className="grid gap-4 md:grid-cols-3">
          {ingestion.map((i) => (
            <Card key={i.step}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <i.icon className="size-5 text-primary" aria-hidden />
                  <Badge variant={i.status === "Available" ? "secondary" : "outline"}>{i.status}</Badge>
                </div>
                <p className="font-semibold">
                  {i.step}. {i.path}
                </p>
                <p className="text-sm text-muted-foreground">{i.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Your panels">
        <div className="space-y-4">
          {labResults.map((panel) => (
            <Card key={panel.id}>
              <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{panel.panel}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {panel.date} · {panel.source}
                  </p>
                </div>
                {panel.reviewed ? (
                  <Badge variant="outline" className="shrink-0 border-success/40 bg-success/10 text-success">
                    Reviewed
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => toast.success("Opened review-and-correct step")}>
                    Review & correct
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marker</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="hidden sm:table-cell">Reference range</TableHead>
                      <TableHead className="w-40">Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {panel.values.map((v) => (
                      <TableRow key={v.name}>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              v.flag === "normal"
                                ? "text-foreground"
                                : v.flag === "low"
                                  ? "font-semibold text-warning"
                                  : "font-semibold text-critical"
                            }
                          >
                            {v.value} {v.unit}
                          </span>
                          {v.flag !== "normal" ? (
                            <span className="ml-2 text-xs uppercase text-muted-foreground">{v.flag}</span>
                          ) : null}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {v.low}–{v.high} {v.unit}
                        </TableCell>
                        <TableCell>
                          <Progress
                            value={pct(v.value, v.low, v.high)}
                            className="h-2"
                            aria-label={`${v.name} relative to reference range`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!panel.reviewed ? (
                  <SafetyNote>
                    OCR output is never used before you confirm it. Check each value against the printed report.
                  </SafetyNote>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="HbA1c over time" description="Six months of results, with the upper reference limit marked.">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hba1cTrend} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[5, 8]} unit="%" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                  <ReferenceLine y={5.7} stroke="var(--color-chart-5)" strokeDasharray="4 4" label={{ value: "Upper reference 5.7%", fontSize: 11, fill: "var(--color-muted-foreground)", position: "insideTopRight" }} />
                  <Line type="monotone" dataKey="value" name="HbA1c" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}