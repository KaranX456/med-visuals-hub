import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "mark_medication_taken",
  title: "Mark medication taken",
  description: "Mark one of the signed-in user's medications as taken (or not taken) today.",
  inputSchema: {
    medicationId: z.string().describe("Medication id from list_medications."),
    taken: z.boolean().optional().describe("Set to false to undo. Defaults to true."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ medicationId, taken }, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("medications")
      .update({ taken_today: taken ?? true })
      .eq("id", medicationId)
      .select()
      .maybeSingle();
    if (error) return failed(error.message);
    if (!data) return failed("No medication found with that id for this account.");
    return json(data, { medication: data });
  },
});
