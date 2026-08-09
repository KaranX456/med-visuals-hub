import { createFileRoute } from "@tanstack/react-router";
import { Camera, Eye, Lock, Search } from "lucide-react";
import { PageHeader, SafetyNote, Section, StageTag } from "@/components/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecureUpload } from "@/components/secure-upload";
import { photoTriageCases } from "@/data/mock";

export const Route = createFileRoute("/patient/photo")({
  head: () => ({
    meta: [
      { title: "Photo Triage Assist — AI Health Companion" },
      { name: "description", content: "Flags worth-a-doctor's-look versus common-and-monitor. Never names a condition." },
      { property: "og:title", content: "Photo Triage Assist — AI Health Companion" },
      { property: "og:description", content: "A second opinion on whether a photo is worth a clinician's eyes." },
    ],
  }),
  component: PhotoTriage,
});

function PhotoTriage() {
  return (
    <>
      <PageHeader
        eyebrow="Patient feature 4"
        title="Photo-based triage assist"
        description="Two outcomes only: worth a doctor's look, or common — monitor. A named condition is never produced here."
        actions={<StageTag stage={1} />}
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-muted text-primary">
            <Camera className="size-7" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Add a photo</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Good light, plain background, and a coin or ruler for scale if you can.
            </p>
          </div>
          <div className="w-full max-w-md text-left">
            <SecureUpload
              bucket="patient-photos"
              accept="image/*"
              label="Upload photo"
              emptyHint="No photos stored yet."
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden /> Private bucket, encrypted at rest, opened only through
            short-lived signed links.
          </p>
        </CardContent>
      </Card>

      <Section title="Previous submissions">
        <div className="grid gap-4 md:grid-cols-2">
          {photoTriageCases.map((c) => (
            <Card key={c.id} className={c.verdict === "worth-a-look" ? "border-warning/40" : "border-success/30"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.area}</CardTitle>
                <p className="text-xs text-muted-foreground">{c.date}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge
                  variant="outline"
                  className={
                    c.verdict === "worth-a-look"
                      ? "gap-1.5 border-warning/40 bg-warning/10 text-warning"
                      : "gap-1.5 border-success/40 bg-success/10 text-success"
                  }
                >
                  {c.verdict === "worth-a-look" ? <Search className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                  {c.verdict === "worth-a-look" ? "Worth a doctor's look" : "Common — monitor"}
                </Badge>
                <p className="text-sm text-muted-foreground">{c.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <SafetyNote>
        Crowdsourced dermatology photo diagnoses match expert graders roughly 69% of the time — good enough to
        raise a flag, nowhere near good enough to name a condition. That is exactly why this screen only routes.
      </SafetyNote>
    </>
  );
}