CREATE TABLE public.model_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  differential_id uuid REFERENCES public.differential_diagnoses(id) ON DELETE SET NULL,
  suggested_condition text NOT NULL,
  confirmed_condition text,
  suggestion_rank integer,
  was_correct boolean,
  category text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.model_feedback TO authenticated;
GRANT ALL ON public.model_feedback TO service_role;

ALTER TABLE public.model_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own or care team or admin" ON public.model_feedback
  FOR SELECT TO authenticated
  USING (public.can_read_patient(patient_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "clinician writes" ON public.model_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));

CREATE POLICY "clinician updates" ON public.model_feedback
  FOR UPDATE TO authenticated
  USING (auth.uid() = clinician_id AND public.is_care_team(patient_id))
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));

CREATE POLICY "clinician deletes" ON public.model_feedback
  FOR DELETE TO authenticated
  USING (auth.uid() = clinician_id AND public.is_care_team(patient_id));

CREATE TRIGGER model_feedback_updated_at
  BEFORE UPDATE ON public.model_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.symptoms_log REPLICA IDENTITY FULL;
ALTER TABLE public.medications REPLICA IDENTITY FULL;
ALTER TABLE public.lab_results REPLICA IDENTITY FULL;
ALTER TABLE public.medical_history REPLICA IDENTITY FULL;
ALTER TABLE public.triage_records REPLICA IDENTITY FULL;
ALTER TABLE public.differential_diagnoses REPLICA IDENTITY FULL;
ALTER TABLE public.soap_notes REPLICA IDENTITY FULL;
ALTER TABLE public.model_feedback REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.symptoms_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.triage_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.differential_diagnoses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.soap_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.model_feedback;