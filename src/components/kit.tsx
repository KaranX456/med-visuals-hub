import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConfidenceTier, Urgency } from "@/data/mock";
import { AlertTriangle, CalendarClock, Eye, Siren } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-6 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "clinical" | "hypothesis" | "warning" | "critical" | "success";
}) {
  const toneRing: Record<string, string> = {
    default: "border-border",
    clinical: "border-clinical/40",
    hypothesis: "border-hypothesis/40",
    warning: "border-warning/50",
    critical: "border-critical/50",
    success: "border-success/40",
  };
  const toneText: Record<string, string> = {
    default: "text-foreground",
    clinical: "text-clinical",
    hypothesis: "text-hypothesis",
    warning: "text-warning",
    critical: "text-critical",
    success: "text-success",
  };
  return (
    <Card className={cn("border shadow-none", toneRing[tone])}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-display text-2xl font-semibold", toneText[tone])}>{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? <div className={cn("shrink-0 rounded-lg bg-muted p-2", toneText[tone])}>{icon}</div> : null}
      </CardContent>
    </Card>
  );
}

const tierCopy: Record<ConfidenceTier, { label: string; className: string }> = {
  "well-established": { label: "Well-established", className: "bg-success/15 text-success border-success/30" },
  emerging: { label: "Emerging", className: "bg-warning/15 text-warning border-warning/30" },
  "rare-contested": { label: "Rare / contested", className: "bg-critical/15 text-critical border-critical/30" },
};

export function TierBadge({ tier }: { tier: ConfidenceTier }) {
  const t = tierCopy[tier];
  return (
    <Badge variant="outline" className={cn("font-medium", t.className)}>
      {t.label}
    </Badge>
  );
}

const urgencyCopy: Record<Urgency, { label: string; className: string; icon: ReactNode }> = {
  emergency: {
    label: "Emergency",
    className: "bg-critical/15 text-critical border-critical/40",
    icon: <Siren className="size-3.5" aria-hidden />,
  },
  "same-day": {
    label: "Same-day care",
    className: "bg-warning/15 text-warning border-warning/40",
    icon: <AlertTriangle className="size-3.5" aria-hidden />,
  },
  scheduled: {
    label: "Scheduled visit",
    className: "bg-clinical/15 text-clinical border-clinical/40",
    icon: <CalendarClock className="size-3.5" aria-hidden />,
  },
  monitor: {
    label: "Monitor",
    className: "bg-success/15 text-success border-success/40",
    icon: <Eye className="size-3.5" aria-hidden />,
  },
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const u = urgencyCopy[urgency];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", u.className)}>
      {u.icon}
      {u.label}
    </Badge>
  );
}

export function StageTag({ stage }: { stage: 1 | 2 }) {
  return stage === 1 ? (
    <Badge variant="outline" className="border-hypothesis/40 bg-hypothesis/10 text-hypothesis">
      Stage 1 · Hypothesis
    </Badge>
  ) : (
    <Badge variant="outline" className="border-clinical/40 bg-clinical/10 text-clinical">
      Stage 2 · Structured scoring
    </Badge>
  );
}

export function SafetyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function Section({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}