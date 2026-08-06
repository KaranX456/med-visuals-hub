import { createFileRoute } from "@tanstack/react-router";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { PageHeader, SafetyNote, Section, StatCard } from "@/components/kit";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { environmentContext as env } from "@/data/mock";

export const Route = createFileRoute("/patient/environment")({
  head: () => ({
    meta: [
      { title: "Environment & Region — AI Health Companion" },
      { name: "description", content: "Weather-linked nudges and regional prevalence, framed correlationally and never causally." },
      { property: "og:title", content: "Environment & Region — AI Health Companion" },
      { property: "og:description", content: "Local conditions and what's going around, in context." },
    ],
  }),
  component: Environment,
});

function Environment() {
  return (
    <>
      <PageHeader
        eyebrow="Patient feature 3"
        title="Environmental & geographic context"
        description={`Conditions around ${env.location}. These are correlations and general nudges — never a claim about what caused your symptoms.`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Temperature" value={`${env.temperature}°C`} hint={env.condition} icon={<CloudSun className="size-5" aria-hidden />} tone="clinical" />
        <StatCard label="Humidity" value={`${env.humidity}%`} hint="High" icon={<Droplets className="size-5" aria-hidden />} />
        <StatCard label="Air quality index" value={String(env.aqi)} hint="Moderate" icon={<Wind className="size-5" aria-hidden />} tone="warning" />
        <StatCard label="Pollen" value={env.pollen} hint="Regional feed" tone="hypothesis" />
      </div>

      <Section title="Today's nudges">
        <div className="grid gap-3 md:grid-cols-2">
          {env.nudges.map((n) => (
            <Card key={n}>
              <CardContent className="p-4 text-sm text-muted-foreground">{n}</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Regional prevalence" description="What is currently circulating where you are.">
        <Card>
          <CardContent className="space-y-4 p-5">
            {env.prevalence.map((p) => (
              <div key={p.condition}>
                <div className="flex justify-between text-sm">
                  <span>{p.condition}</span>
                  <span className="text-muted-foreground">
                    {p.level} · {p.trend}
                  </span>
                </div>
                <Progress value={p.level} className="mt-1.5 h-2" aria-label={`${p.condition} prevalence index`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <SafetyNote>
        Prevalence data acts as a geographic prior in the structured scoring engine. On this screen it is shown as
        awareness only.
      </SafetyNote>
    </>
  );
}