import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "log_symptom",
  title: "Log a symptom",
  description: "Record a new symptom entry for the signed-in patient.",
  inputSchema: {
    name: z.string().trim().describe("Symptom name, e.g. 'Night sweats'."),
    severity: z.number().int().optional().describe("Severity from 1 (mild) to 10 (severe)."),
    onset: z.string().optional().describe("Onset date as YYYY-MM-DD."),
    frequency: z.string().optional().describe("How often it occurs, e.g. 'Most days'."),
    notes: z.string().optional().describe("Free-text context."),
    tags: z.array(z.string()).optional().describe("Body-system tags, e.g. ['Respiratory']."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    if (!input.name) return failed("A symptom name is required.");
    const severity = input.severity == null ? null : Math.min(Math.max(input.severity, 1), 10);
    const { data, error } = await supabaseForUser(ctx)
      .from("symptoms_log")
      .insert({
        patient_id: ctx.getUserId(),
        name: input.name,
        severity,
        onset: input.onset ?? null,
        frequency: input.frequency ?? null,
        notes: input.notes ?? null,
        tags: input.tags ?? [],
      })
      .select()
      .single();
    if (error) return failed(error.message);
    return json(data, { symptom: data });
  },
});
