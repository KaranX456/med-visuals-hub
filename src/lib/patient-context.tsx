import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCareTeamPatients, useRealtimeClinicalSync, type CareTeamPatient } from "@/lib/clinical-data";

type Value = {
  patients: CareTeamPatient[];
  selected: CareTeamPatient | null;
  select: (id: string) => void;
  loading: boolean;
};

const Ctx = createContext<Value | null>(null);

export function SelectedPatientProvider({ children }: { children: ReactNode }) {
  const { data: patients, isLoading } = useCareTeamPatients();
  const [id, setId] = useState<string | null>(null);

  const list = useMemo(() => patients ?? [], [patients]);

  useEffect(() => {
    if (!id && list.length) setId(list[0]!.patientId);
  }, [id, list]);

  const selected = list.find((p) => p.patientId === id) ?? null;
  useRealtimeClinicalSync(selected?.patientId);

  return (
    <Ctx.Provider value={{ patients: list, selected, select: setId, loading: isLoading }}>{children}</Ctx.Provider>
  );
}

export function useSelectedPatient() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSelectedPatient must be used inside SelectedPatientProvider");
  return ctx;
}

export function PatientSwitcher() {
  const { patients, selected, select } = useSelectedPatient();
  if (!patients.length) return null;
  return (
    <Select value={selected?.patientId ?? ""} onValueChange={select}>
      <SelectTrigger className="w-56" aria-label="Select patient">
        <SelectValue placeholder="Select patient" />
      </SelectTrigger>
      <SelectContent>
        {patients.map((p) => (
          <SelectItem key={p.patientId} value={p.patientId}>
            {p.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Shown on clinician screens when no patient has shared a record yet. */
export function NoPatientNotice() {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      No patient has granted you access yet. A patient shares their record from{" "}
      <Link to="/patient/handoff" className="font-medium text-primary underline">
        Doctor hand-off
      </Link>{" "}
      using your clinician ID. Live data appears here the moment they do.
    </div>
  );
}
