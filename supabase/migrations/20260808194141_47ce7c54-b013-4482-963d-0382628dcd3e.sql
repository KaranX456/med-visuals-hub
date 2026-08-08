
-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('patient', 'clinician', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  sex TEXT,
  region TEXT,
  altitude TEXT,
  climate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.care_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinician_id, patient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_assignments TO authenticated;
GRANT ALL ON public.care_assignments TO service_role;
ALTER TABLE public.care_assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_care_team(_patient_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.care_assignments
    WHERE patient_id = _patient_id AND clinician_id = auth.uid() AND active
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_patient(_patient_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() = _patient_id OR public.is_care_team(_patient_id);
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new signups get a profile + default patient role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role',''), 'patient')::public.app_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- profile / role / assignment policies
CREATE POLICY "read own or assigned profile" ON public.profiles FOR SELECT TO authenticated
  USING (public.can_read_patient(id));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read own assignments" ON public.care_assignments FOR SELECT TO authenticated
  USING (auth.uid() = clinician_id OR auth.uid() = patient_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "patient manages own assignments" ON public.care_assignments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "patient revokes own assignments" ON public.care_assignments FOR DELETE TO authenticated
  USING (auth.uid() = patient_id);

-- CLINICAL TABLES ------------------------------------------------------
CREATE TABLE public.symptoms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  onset DATE,
  severity INTEGER CHECK (severity BETWEEN 0 AND 10),
  frequency TEXT,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  schedule TEXT,
  started DATE,
  adherence INTEGER CHECK (adherence BETWEEN 0 AND 100),
  timing_guidance TEXT,
  taken_today BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  panel TEXT NOT NULL,
  analyte TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  reference_low NUMERIC,
  reference_high NUMERIC,
  status TEXT,
  collected_on DATE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  severity TEXT,
  occurred_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  urgency TEXT NOT NULL,
  summary TEXT,
  red_flags TEXT[] NOT NULL DEFAULT '{}',
  guidance TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.differential_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  condition TEXT NOT NULL,
  probability NUMERIC,
  confidence_tier TEXT,
  supporting_evidence TEXT[] NOT NULL DEFAULT '{}',
  contradicting_evidence TEXT[] NOT NULL DEFAULT '{}',
  suggested_tests TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  signed BOOLEAN NOT NULL DEFAULT false,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER soap_notes_updated_at BEFORE UPDATE ON public.soap_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- grants + RLS for patient-owned tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['symptoms_log','medications','lab_results','medical_history','triage_records'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "read own or care team" ON public.%I FOR SELECT TO authenticated USING (public.can_read_patient(patient_id))', t);
    EXECUTE format('CREATE POLICY "patient inserts own" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id)', t);
    EXECUTE format('CREATE POLICY "patient updates own" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id)', t);
    EXECUTE format('CREATE POLICY "patient deletes own" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = patient_id)', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.differential_diagnoses TO authenticated;
GRANT ALL ON public.differential_diagnoses TO service_role;
ALTER TABLE public.differential_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or care team" ON public.differential_diagnoses FOR SELECT TO authenticated
  USING (public.can_read_patient(patient_id));
CREATE POLICY "clinician writes" ON public.differential_diagnoses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));
CREATE POLICY "clinician updates" ON public.differential_diagnoses FOR UPDATE TO authenticated
  USING (auth.uid() = clinician_id AND public.is_care_team(patient_id))
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));
CREATE POLICY "clinician deletes" ON public.differential_diagnoses FOR DELETE TO authenticated
  USING (auth.uid() = clinician_id AND public.is_care_team(patient_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.soap_notes TO authenticated;
GRANT ALL ON public.soap_notes TO service_role;
ALTER TABLE public.soap_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or care team" ON public.soap_notes FOR SELECT TO authenticated
  USING (public.can_read_patient(patient_id));
CREATE POLICY "clinician writes" ON public.soap_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));
CREATE POLICY "clinician updates" ON public.soap_notes FOR UPDATE TO authenticated
  USING (auth.uid() = clinician_id AND public.is_care_team(patient_id) AND NOT signed)
  WITH CHECK (auth.uid() = clinician_id AND public.is_care_team(patient_id));

CREATE INDEX ON public.symptoms_log (patient_id);
CREATE INDEX ON public.medications (patient_id);
CREATE INDEX ON public.lab_results (patient_id);
CREATE INDEX ON public.medical_history (patient_id);
CREATE INDEX ON public.triage_records (patient_id);
CREATE INDEX ON public.differential_diagnoses (patient_id);
CREATE INDEX ON public.soap_notes (patient_id);
