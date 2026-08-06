import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Pill,
  FlaskConical,
  ShieldAlert,
  Camera,
  HeartPulse,
  Users,
  CloudSun,
  Share2,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  ListOrdered,
  AlertTriangle,
  FileText,
  LineChart,
  CheckCircle2,
  Gauge,
  Workflow,
  Scale,
  ListChecks,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export type Role = "patient" | "doctor" | "admin";

type NavItem = { to: string; label: string; icon: typeof Activity };

const NAV: Record<Role, { title: string; subtitle: string; items: NavItem[] }> = {
  patient: {
    title: "Patient companion",
    subtitle: "Wellness & triage track",
    items: [
      { to: "/patient", label: "Overview", icon: LayoutDashboard },
      { to: "/patient/symptoms", label: "Symptom organizer", icon: Activity },
      { to: "/patient/medications", label: "Medication companion", icon: Pill },
      { to: "/patient/labs", label: "Lab results", icon: FlaskConical },
      { to: "/patient/history", label: "Medical history", icon: ClipboardList },
      { to: "/patient/triage", label: "Urgency guidance", icon: ShieldAlert },
      { to: "/patient/photo", label: "Photo triage assist", icon: Camera },
      { to: "/patient/wellbeing", label: "Wellbeing check-ins", icon: HeartPulse },
      { to: "/patient/community", label: "Community perspective", icon: Users },
      { to: "/patient/environment", label: "Environment & region", icon: CloudSun },
      { to: "/patient/handoff", label: "Doctor hand-off", icon: Share2 },
    ],
  },
  doctor: {
    title: "Clinical decision support",
    subtitle: "Doctor remains decision-maker",
    items: [
      { to: "/doctor", label: "Today's list", icon: LayoutDashboard },
      { to: "/doctor/dossier", label: "Patient dossier", icon: Stethoscope },
      { to: "/doctor/differential", label: "Differential panel", icon: ListOrdered },
      { to: "/doctor/flags", label: "Interaction flags", icon: AlertTriangle },
      { to: "/doctor/soap", label: "SOAP note assist", icon: FileText },
      { to: "/doctor/monitoring", label: "Longitudinal monitoring", icon: LineChart },
      { to: "/doctor/feedback", label: "Diagnosis feedback loop", icon: CheckCircle2 },
    ],
  },
  admin: {
    title: "Validation & governance",
    subtitle: "Accuracy as a measured result",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard },
      { to: "/admin/accuracy", label: "Accuracy by category", icon: Gauge },
      { to: "/admin/pipeline", label: "Pipeline health", icon: Workflow },
      { to: "/admin/regulatory", label: "Regulatory register", icon: Scale },
      { to: "/admin/roadmap", label: "Open next steps", icon: ListChecks },
    ],
  },
};

const roleLinks: { role: Role; to: string; label: string }[] = [
  { role: "patient", to: "/patient", label: "Patient" },
  { role: "doctor", to: "/doctor", label: "Doctor" },
  { role: "admin", to: "/admin", label: "Admin" },
];

function NavList({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { items } = NAV[role];
  return (
    <nav aria-label={`${role} navigation`} className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ role }: { role: Role }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-clinical text-primary-foreground">
        <HeartPulse className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{NAV[role].title}</p>
        <p className="truncate text-xs text-muted-foreground">{NAV[role].subtitle}</p>
      </div>
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand role={role} />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavList role={role} />
        </div>
        <div className="mt-4 space-y-3 border-t border-sidebar-border pt-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {roleLinks.map((r) => (
              <Link
                key={r.role}
                to={r.to}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition-colors",
                  r.role === role
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </Link>
            ))}
          </div>
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to overview
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Open navigation">
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-sidebar p-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand role={role} />
                <div className="mt-6">
                  <NavList role={role} onNavigate={() => setOpen(false)} />
                </div>
                <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1">
                  {roleLinks.map((r) => (
                    <Link
                      key={r.role}
                      to={r.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-2 text-center text-xs font-medium",
                        r.role === role ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0 lg:hidden">
              <Brand role={role} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">Demo data · not for clinical use</span>
            <ThemeToggle />
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          AI Health Companion — prototype interface with mock data. Not a medical device; does not provide
          diagnosis. The doctor remains the final clinical decision-maker.
        </footer>
      </div>
    </div>
  );
}