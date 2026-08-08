export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      care_assignments: {
        Row: {
          active: boolean
          clinician_id: string
          created_at: string
          id: string
          patient_id: string
        }
        Insert: {
          active?: boolean
          clinician_id: string
          created_at?: string
          id?: string
          patient_id: string
        }
        Update: {
          active?: boolean
          clinician_id?: string
          created_at?: string
          id?: string
          patient_id?: string
        }
        Relationships: []
      }
      differential_diagnoses: {
        Row: {
          clinician_id: string | null
          condition: string
          confidence_tier: string | null
          contradicting_evidence: string[]
          created_at: string
          id: string
          patient_id: string
          probability: number | null
          status: string
          suggested_tests: string[]
          supporting_evidence: string[]
        }
        Insert: {
          clinician_id?: string | null
          condition: string
          confidence_tier?: string | null
          contradicting_evidence?: string[]
          created_at?: string
          id?: string
          patient_id: string
          probability?: number | null
          status?: string
          suggested_tests?: string[]
          supporting_evidence?: string[]
        }
        Update: {
          clinician_id?: string | null
          condition?: string
          confidence_tier?: string | null
          contradicting_evidence?: string[]
          created_at?: string
          id?: string
          patient_id?: string
          probability?: number | null
          status?: string
          suggested_tests?: string[]
          supporting_evidence?: string[]
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          analyte: string
          collected_on: string | null
          created_at: string
          id: string
          panel: string
          patient_id: string
          reference_high: number | null
          reference_low: number | null
          source: string | null
          status: string | null
          unit: string | null
          value: number | null
        }
        Insert: {
          analyte: string
          collected_on?: string | null
          created_at?: string
          id?: string
          panel: string
          patient_id: string
          reference_high?: number | null
          reference_low?: number | null
          source?: string | null
          status?: string | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          analyte?: string
          collected_on?: string | null
          created_at?: string
          id?: string
          panel?: string
          patient_id?: string
          reference_high?: number | null
          reference_low?: number | null
          source?: string | null
          status?: string | null
          unit?: string | null
          value?: number | null
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          label: string
          occurred_on: string | null
          patient_id: string
          severity: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          label: string
          occurred_on?: string | null
          patient_id: string
          severity?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          label?: string
          occurred_on?: string | null
          patient_id?: string
          severity?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean
          adherence: number | null
          created_at: string
          dose: string | null
          id: string
          name: string
          patient_id: string
          schedule: string | null
          started: string | null
          taken_today: boolean
          timing_guidance: string | null
        }
        Insert: {
          active?: boolean
          adherence?: number | null
          created_at?: string
          dose?: string | null
          id?: string
          name: string
          patient_id: string
          schedule?: string | null
          started?: string | null
          taken_today?: boolean
          timing_guidance?: string | null
        }
        Update: {
          active?: boolean
          adherence?: number | null
          created_at?: string
          dose?: string | null
          id?: string
          name?: string
          patient_id?: string
          schedule?: string | null
          started?: string | null
          taken_today?: boolean
          timing_guidance?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          altitude: string | null
          climate: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          region: string | null
          sex: string | null
          updated_at: string
        }
        Insert: {
          altitude?: string | null
          climate?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id: string
          region?: string | null
          sex?: string | null
          updated_at?: string
        }
        Update: {
          altitude?: string | null
          climate?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          region?: string | null
          sex?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      soap_notes: {
        Row: {
          assessment: string | null
          clinician_id: string | null
          created_at: string
          id: string
          objective: string | null
          patient_id: string
          plan: string | null
          signed: boolean
          subjective: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          assessment?: string | null
          clinician_id?: string | null
          created_at?: string
          id?: string
          objective?: string | null
          patient_id: string
          plan?: string | null
          signed?: boolean
          subjective?: string | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          assessment?: string | null
          clinician_id?: string | null
          created_at?: string
          id?: string
          objective?: string | null
          patient_id?: string
          plan?: string | null
          signed?: boolean
          subjective?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: []
      }
      symptoms_log: {
        Row: {
          created_at: string
          frequency: string | null
          id: string
          name: string
          notes: string | null
          onset: string | null
          patient_id: string
          severity: number | null
          tags: string[]
        }
        Insert: {
          created_at?: string
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          onset?: string | null
          patient_id: string
          severity?: number | null
          tags?: string[]
        }
        Update: {
          created_at?: string
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          onset?: string | null
          patient_id?: string
          severity?: number | null
          tags?: string[]
        }
        Relationships: []
      }
      triage_records: {
        Row: {
          created_at: string
          guidance: string | null
          id: string
          patient_id: string
          red_flags: string[]
          summary: string | null
          urgency: string
        }
        Insert: {
          created_at?: string
          guidance?: string | null
          id?: string
          patient_id: string
          red_flags?: string[]
          summary?: string | null
          urgency: string
        }
        Update: {
          created_at?: string
          guidance?: string | null
          id?: string
          patient_id?: string
          red_flags?: string[]
          summary?: string | null
          urgency?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_patient: { Args: { _patient_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_care_team: { Args: { _patient_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "patient" | "clinician" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "clinician", "admin"],
    },
  },
} as const
