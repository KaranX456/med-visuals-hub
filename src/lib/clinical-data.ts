import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Table =
  | "symptoms_log"
  | "medications"
  | "lab_results"
  | "medical_history"
  | "triage_records"
  | "differential_diagnoses"
  | "soap_notes"
  | "model_feedback";

export const CLINICAL_TABLES: Table[] = [
  "symptoms_log",
  "medications",
  "lab_results",
  "medical_history",
  "triage_records",
  "differential_diagnoses",
  "soap_notes",
  "model_feedback",
];

/** Reads a patient-scoped table through RLS. Returns [] until signed in. */
function usePatientTable<T>(table: Table, patientId?: string) {
  const { user } = useAuth();
  const id = patientId ?? user?.id;

  return useQuery({
    queryKey: [table, id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("patient_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

/**
 * Live sync: every insert/update/delete on a patient's clinical rows
 * invalidates the matching query so all open portals refresh instantly.
 */
export function useRealtimeClinicalSync(patientId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const id = patientId ?? user?.id;

  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`clinical-${id}`);
    for (const table of CLINICAL_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `patient_id=eq.${id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: [table] });
        },
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, queryClient]);
}

/** Admin-wide live sync on the validation feedback stream. */
export function useRealtimeFeedbackSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("model-feedback-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "model_feedback" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["model_feedback"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export type SymptomRow = {
  id: string;
  name: string;
  onset: string | null;
  severity: number | null;
  frequency: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
};

export type MedicationRow = {
  id: string;
  name: string;
  dose: string | null;
  schedule: string | null;
  started: string | null;
  adherence: number | null;
  timing_guidance: string | null;
  taken_today: boolean;
  active: boolean;
};

export type LabRow = {
  id: string;
  panel: string;
  analyte: string;
  value: number | null;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  status: string | null;
  collected_on: string | null;
};

export type HistoryRow = {
  id: string;
  kind: string;
  label: string;
  detail: string | null;
  severity: string | null;
  occurred_on: string | null;
};

export type TriageRow = {
  id: string;
  urgency: string;
  summary: string | null;
  red_flags: string[];
  guidance: string | null;
  created_at: string;
};

export type SoapRow = {
  id: string;
  patient_id: string;
  clinician_id: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  signed: boolean;
  visit_date: string;
  updated_at: string;
};

export type FeedbackRow = {
  id: string;
  patient_id: string;
  clinician_id: string | null;
  suggested_condition: string;
  confirmed_condition: string | null;
  suggestion_rank: number | null;
  was_correct: boolean | null;
  category: string | null;
  notes: string | null;
  created_at: string;
};

export const useSymptoms = (patientId?: string) => usePatientTable<SymptomRow>("symptoms_log", patientId);
export const useMedications = (patientId?: string) => usePatientTable<MedicationRow>("medications", patientId);
export const useLabResults = (patientId?: string) => usePatientTable<LabRow>("lab_results", patientId);
export const useMedicalHistory = (patientId?: string) => usePatientTable<HistoryRow>("medical_history", patientId);
export const useTriageRecords = (patientId?: string) => usePatientTable<TriageRow>("triage_records", patientId);
export const useDifferentials = (patientId?: string) =>
  usePatientTable<Record<string, unknown>>("differential_diagnoses", patientId);
export const useSoapNotes = (patientId?: string) => usePatientTable<SoapRow>("soap_notes", patientId);
export const usePatientFeedback = (patientId?: string) => usePatientTable<FeedbackRow>("model_feedback", patientId);

/** Admin view: every feedback entry visible to the signed-in user (admins see all). */
export function useAllFeedback() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["model_feedback", "all"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FeedbackRow[];
    },
  });
}

export type CareTeamPatient = {
  assignmentId: string;
  patientId: string;
  fullName: string;
  region: string | null;
  dateOfBirth: string | null;
};

/** Patients who have granted the signed-in clinician access. */
export function useCareTeamPatients() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["care_assignments", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<CareTeamPatient[]> => {
      const { data: assignments, error } = await supabase
        .from("care_assignments")
        .select("id, patient_id, created_at")
        .eq("clinician_id", user!.id)
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const ids = (assignments ?? []).map((a) => a.patient_id);
      if (!ids.length) return [];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, region, date_of_birth")
        .in("id", ids);
      if (pErr) throw pErr;
      return (assignments ?? []).map((a) => {
        const p = (profiles ?? []).find((x) => x.id === a.patient_id);
        return {
          assignmentId: a.id,
          patientId: a.patient_id,
          fullName: p?.full_name?.trim() || "Unnamed patient",
          region: p?.region ?? null,
          dateOfBirth: p?.date_of_birth ?? null,
        };
      });
    },
  });
}

/** Clinicians the signed-in patient has granted access to. */
export function useMyCareTeam() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["care_assignments", "mine", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("care_assignments")
        .select("id, clinician_id, active, created_at")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ---------------- mutations ---------------- */

export async function addSymptom(input: {
  patient_id: string;
  name: string;
  onset: string | null;
  severity: number;
  notes: string | null;
}) {
  const { error } = await supabase.from("symptoms_log").insert(input);
  if (error) throw error;
}

export async function addMedication(input: {
  patient_id: string;
  name: string;
  dose: string | null;
  schedule: string | null;
  timing_guidance?: string | null;
}) {
  const { error } = await supabase.from("medications").insert({ ...input, adherence: 100 });
  if (error) throw error;
}

export async function setMedicationTaken(id: string, taken: boolean) {
  const { error } = await supabase.from("medications").update({ taken_today: taken }).eq("id", id);
  if (error) throw error;
}

export async function addHistoryEntry(input: {
  patient_id: string;
  kind: string;
  label: string;
  detail: string | null;
  severity?: string | null;
  occurred_on?: string | null;
}) {
  const { error } = await supabase.from("medical_history").insert(input);
  if (error) throw error;
}

export async function addTriageRecord(input: {
  patient_id: string;
  urgency: string;
  summary: string;
  guidance: string;
  red_flags: string[];
}) {
  const { error } = await supabase.from("triage_records").insert(input);
  if (error) throw error;
}

export async function createSoapNote(input: {
  patient_id: string;
  clinician_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}) {
  const { data, error } = await supabase.from("soap_notes").insert(input).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateSoapNote(
  id: string,
  patch: Partial<Pick<SoapRow, "subjective" | "objective" | "assessment" | "plan" | "signed">>,
) {
  const { error } = await supabase.from("soap_notes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addFeedback(input: {
  patient_id: string;
  clinician_id: string;
  suggested_condition: string;
  confirmed_condition: string;
  suggestion_rank: number | null;
  was_correct: boolean;
  category: string | null;
  notes: string | null;
}) {
  const { error } = await supabase.from("model_feedback").insert(input);
  if (error) throw error;
}

export async function grantCareAccess(patientId: string, clinicianId: string) {
  const { error } = await supabase
    .from("care_assignments")
    .insert({ patient_id: patientId, clinician_id: clinicianId, active: true });
  if (error) throw error;
}

export async function revokeCareAccess(assignmentId: string) {
  const { error } = await supabase.from("care_assignments").delete().eq("id", assignmentId);
  if (error) throw error;
}
