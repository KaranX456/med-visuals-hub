import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { failed, isAuthed, json, unauthenticated } from "./_shared";

export default defineTool({
  name: "list_lab_results",
  title: "List lab results",
  description: "List the signed-in user's lab analytes with values, units and reference ranges.",
  inputSchema: {
    panel: z.string().optional().describe("Filter to a single panel name, e.g. 'Complete Blood Count'."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ panel, limit }, ctx) => {
    if (!isAuthed(ctx)) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 50, 1), 200);
    let query = supabaseForUser(ctx)
      .from("lab_results")
      .select("id,panel,analyte,value,unit,reference_low,reference_high,status,collected_on,source")
      .order("collected_on", { ascending: false })
      .limit(take);
    if (panel) query = query.eq("panel", panel);
    const { data, error } = await query;
    if (error) return failed(error.message);
    return json(data ?? [], { labResults: data ?? [] });
  },
});
