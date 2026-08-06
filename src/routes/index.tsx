import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Database, HeartPulse, Scale, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Health Companion — Triage & Clinical Decision Support" },
      {
        name: "description",
        content:
          "A two-stage health platform: Reddit-driven hypothesis generation, structured epidemiological scoring, and a visible evidence trail for clinicians.",
      },
      { property: "og:title", content: "AI Health Companion — Triage & Clinical Decision Support" },
      {
        property: "og:description",
        content: "Patient companion, doctor decision support, and validation governance in one prototype.",
      },
    ],
  }),
  component: Index,
});

const roles = [
  {
    to: "/patient",
    icon: HeartPulse,
    title: "Patient companion",
    body: "Symptom organizer, medication companion, urgency guidance, wellbeing check-ins and one-tap doctor hand-off.",
    tone: "Wellness & triage track",
  },
  {
    to: "/doctor",
    icon: Stethoscope,
    title: "Clinical decision support",
    body: "Consolidated dossier, ranked differential with evidence trail, interaction flags, SOAP assist and the feedback loop.",
    tone: "Software as a Medical Device track",
  },
  {
    to: "/admin",
    icon: Scale,
    title: "Validation & governance",
    body: "Accuracy tracked per condition category, pipeline health, regulatory register and the open next steps.",
    tone: "Measured, not asserted",
  },
] as const;

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-clinical text-primary-foreground">
            <HeartPulse className="size-5" aria-hidden />
          </span>
          <span className="truncate font-display text-sm font-semibold">AI Health Companion</span>
        </div>
        <ThemeToggle />
      </header>

      <section className="surface-grid border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Badge variant="outline" className="border-clinical/40 bg-clinical/10 text-clinical">
            Prototype interface · mock data
          </Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Lived experience generates the hypothesis. Structured data does the scoring.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Reddit is a hypothesis-generation layer — never a diagnostic authority. Epidemiological priors and
            structured clinical likelihoods produce a ranked differential with a visible evidence trail, and the
            doctor stays the final decision-maker.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/patient">
                Open patient companion <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/doctor">Open clinician view</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold">The two-stage pipeline</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Card className="border-hypothesis/40">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-hypothesis/40 bg-hypothesis/10 text-hypothesis">
                Stage 1
              </Badge>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="size-4 text-hypothesis" aria-hidden /> Hypothesis generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Reddit symptom posts in patient language, plus patient inputs — symptoms, photos.</p>
              <p>An NLP layer extracts symptom vocabulary and surfaces candidate hypotheses.</p>
              <p className="font-medium text-foreground">Reddit's job stops here. It never computes a probability.</p>
            </CardContent>
          </Card>

          <div className="grid place-items-center py-2">
            <ArrowRight className="size-6 rotate-90 text-muted-foreground lg:rotate-0" aria-hidden />
          </div>

          <Card className="border-clinical/40">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-clinical/40 bg-clinical/10 text-clinical">
                Stage 2
              </Badge>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="size-4 text-clinical" aria-hidden /> Probabilistic scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Geographic and epidemiological priors: prevalence, altitude, climate, surveillance.</p>
              <p>Structured likelihoods: FAERS, DrugBank, ICD-10, PubMed-derived knowledge.</p>
              <p className="font-medium text-foreground">
                Bayesian combination → ranked probability, never a bare percentage.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-4 rounded-lg border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
          Lab values and medical history are patient input routed <strong className="text-foreground">directly to
          Stage 2</strong>, bypassing the hypothesis layer entirely — they are already precise, structured data.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="text-xl font-semibold">Choose a surface</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <Link key={r.to} to={r.to} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <r.icon className="size-6 text-primary" aria-hidden />
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.tone}</p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{r.body}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:px-6">
          <p className="flex items-center gap-2">
            <Users className="size-4" aria-hidden />
            Community content is labelled lived experience, never clinical evidence.
          </p>
          <p>Prototype with mock data. Not a medical device.</p>
        </div>
      </footer>
    </div>
  );
}
