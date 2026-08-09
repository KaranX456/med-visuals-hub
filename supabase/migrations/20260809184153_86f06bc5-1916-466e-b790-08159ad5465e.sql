-- Files are stored as <patient_id>/<filename>
CREATE POLICY "Patients manage own triage photos"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'patient-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'patient-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Care team reads triage photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patient-photos' AND public.is_care_team(((storage.foldername(name))[1])::uuid));

CREATE POLICY "Patients manage own lab documents"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'lab-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'lab-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Care team reads lab documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lab-documents' AND public.is_care_team(((storage.foldername(name))[1])::uuid));