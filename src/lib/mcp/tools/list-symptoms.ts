import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "list_symptoms",
  title: "List logged symptoms",
  description: "List the signed-in user's logged symptoms, newest first.",
  inputSchema: { limit: z.number().int().optional().describe("Maximum number of entries to return (default 20).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const { data, error } = await supabaseForUser(ctx)
      .from("symptoms_log")
      .select("id,name,onset,severity,frequency,notes,tags,created_at")
      .order("created_at", { ascending: false })
      .limit(take);
    if (error) return failed(error.message);
    return json(data ?? [], { symptoms: data ?? [] });
  },
});
