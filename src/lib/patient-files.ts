import { supabase } from "@/integrations/supabase/client";

export type PatientBucket = "patient-photos" | "lab-documents";

export type StoredFile = {
  name: string;
  path: string;
  size: number;
  createdAt: string;
};

/** Files live at <patient_id>/<filename> — storage policies key off that first folder. */
export async function uploadPatientFile(bucket: PatientBucket, patientId: string, file: File) {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${patientId}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  return path;
}

export async function listPatientFiles(bucket: PatientBucket, patientId: string): Promise<StoredFile[]> {
  const { data, error } = await supabase.storage.from(bucket).list(patientId, {
    limit: 50,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => ({
      name: f.name,
      path: `${patientId}/${f.name}`,
      size: (f.metadata as { size?: number } | null)?.size ?? 0,
      createdAt: f.created_at ?? "",
    }));
}

/** Private buckets: reads go through a short-lived signed URL. */
export async function signedFileUrl(bucket: PatientBucket, path: string, seconds = 300) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function deletePatientFile(bucket: PatientBucket, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}