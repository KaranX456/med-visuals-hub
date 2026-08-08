import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Table =
  | "symptoms_log"
  | "medications"
  | "lab_results"
  | "medical_history"
  | "triage_records"
  | "differential_diagnoses"
  | "soap_notes";

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

export type SymptomRow = {
  id: string;
  name: string;
  onset: string | null;
  severity: number | null;
  frequency: string | null;
  notes: string | null;
  tags: string[];
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
};

export const useSymptoms = (patientId?: string) => usePatientTable<SymptomRow>("symptoms_log", patientId);
export const useMedications = (patientId?: string) => usePatientTable<MedicationRow>("medications", patientId);
export const useLabResults = (patientId?: string) => usePatientTable<Record<string, unknown>>("lab_results", patientId);
export const useMedicalHistory = (patientId?: string) =>
  usePatientTable<Record<string, unknown>>("medical_history", patientId);
export const useTriageRecords = (patientId?: string) =>
  usePatientTable<Record<string, unknown>>("triage_records", patientId);
export const useDifferentials = (patientId?: string) =>
  usePatientTable<Record<string, unknown>>("differential_diagnoses", patientId);
export const useSoapNotes = (patientId?: string) => usePatientTable<Record<string, unknown>>("soap_notes", patientId);

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
