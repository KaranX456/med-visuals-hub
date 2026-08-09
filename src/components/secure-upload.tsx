import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  deletePatientFile,
  listPatientFiles,
  signedFileUrl,
  uploadPatientFile,
  type PatientBucket,
} from "@/lib/patient-files";

const MAX_BYTES = 10 * 1024 * 1024;

function humanSize(bytes: number) {
  if (!bytes) return "—";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function SecureUpload({
  bucket,
  accept,
  label,
  emptyHint,
}: {
  bucket: PatientBucket;
  accept: string;
  label: string;
  emptyHint: string;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const files = useQuery({
    queryKey: [bucket, user?.id],
    enabled: Boolean(user),
    queryFn: () => listPatientFiles(bucket, user!.id),
  });

  const remove = useMutation({
    mutationFn: (path: string) => deletePatientFile(bucket, path),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [bucket] });
      toast.success("File removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFile(file: File) {
    if (!user) return;
    if (file.size > MAX_BYTES) {
      toast.error("Files must be under 10 MB");
      return;
    }
    setBusy(true);
    try {
      await uploadPatientFile(bucket, user.id, file);
      await queryClient.invalidateQueries({ queryKey: [bucket] });
      toast.success("Uploaded to your private record", {
        description: "Encrypted at rest. Only you and your active care team can open it.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function open(path: string) {
    try {
      window.open(await signedFileUrl(bucket, path), "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open that file");
    }
  }

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Sign in to upload files securely. {emptyHint}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
        {label}
      </Button>

      {files.data && files.data.length > 0 ? (
        <ul className="space-y-2">
          {files.data.map((f) => (
            <li
              key={f.path}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{f.name.replace(/^\d+-/, "")}</p>
                <p className="text-xs text-muted-foreground">
                  {humanSize(f.size)}
                  {f.createdAt ? ` · ${new Date(f.createdAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label={`Open ${f.name}`} onClick={() => void open(f.path)}>
                  <Download className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${f.name}`}
                  onClick={() => remove.mutate(f.path)}
                >
                  <Trash2 className="size-4 text-critical" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      )}
    </div>
  );
}