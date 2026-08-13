import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "list_medications",
  title: "List medications",
  description: "List the signed-in user's medications with dose, schedule, adherence and today's status.",
  inputSchema: { includeInactive: z.boolean().optional().describe("Include stopped medications (default false).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ includeInactive }, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("medications")
      .select("id,name,dose,schedule,started,adherence,timing_guidance,taken_today,active")
      .order("created_at", { ascending: false });
    if (!includeInactive) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) return failed(error.message);
    return json(data ?? [], { medications: data ?? [] });
  },
});
