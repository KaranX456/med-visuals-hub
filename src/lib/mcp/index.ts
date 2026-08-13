import { auth, defineMcp } from "@lovable.dev/mcp-js";
import type { AnyToolDefinition } from "@lovable.dev/mcp-js";
import getHealthSummary from "./tools/get-health-summary";
import listLabResults from "./tools/list-lab-results";
import listMedications from "./tools/list-medications";
import listSymptoms from "./tools/list-symptoms";
import logSymptom from "./tools/log-symptom";
import markMedicationTaken from "./tools/mark-medication-taken";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "health-companion-portal",
  title: "Health Companion Portal",
  version: "0.1.0",
  instructions:
    "Tools for the AI Health Companion. Read and update the signed-in patient's own record: symptoms, medications, lab results and an overall health summary. All data is patient-reported; never present it as a diagnosis.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getHealthSummary,
    listSymptoms,
    logSymptom,
    listMedications,
    markMedicationTaken,
    listLabResults,
  ] as unknown as AnyToolDefinition[],
});
