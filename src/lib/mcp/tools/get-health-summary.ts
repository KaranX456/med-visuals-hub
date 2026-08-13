import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "get_health_summary",
  title: "Get health summary",
  description:
    "Summarise the signed-in user's record: profile, recent symptoms, active medications, latest labs, history and triage records.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const [profile, symptoms, meds, labs, history, triage] = await Promise.all([
      supabase.from("profiles").select("full_name,date_of_birth,sex,region,altitude,climate").eq("id", ctx.getUserId()!).maybeSingle(),
      supabase.from("symptoms_log").select("name,severity,onset,frequency,notes").order("created_at", { ascending: false }).limit(10),
      supabase.from("medications").select("name,dose,schedule,adherence,taken_today").eq("active", true),
      supabase.from("lab_results").select("panel,analyte,value,unit,status,collected_on").order("collected_on", { ascending: false }).limit(15),
      supabase.from("medical_history").select("kind,label,detail,severity,occurred_on"),
      supabase.from("triage_records").select("urgency,summary,red_flags,guidance,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    const firstError = [profile, symptoms, meds, labs, history, triage].find((r) => r.error)?.error;
    if (firstError) return failed(firstError.message);
    const summary = {
      profile: profile.data ?? null,
      recentSymptoms: symptoms.data ?? [],
      activeMedications: meds.data ?? [],
      recentLabs: labs.data ?? [],
      medicalHistory: history.data ?? [],
      recentTriage: triage.data ?? [],
      disclaimer: "Patient-reported record. Not a diagnosis and not a substitute for clinical care.",
    };
    return json(summary, summary);
  },
});
