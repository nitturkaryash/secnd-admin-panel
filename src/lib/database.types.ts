export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date_time: string
          created_at: string | null
          doctor_id: string | null
          end_time: string | null
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date_time: string
          created_at?: string | null
          doctor_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date_time?: string
          created_at?: string | null
          doctor_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          name: string
          specialty: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          specialty: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          specialty?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          is_private: boolean | null
          location: string | null
          memory_date: string | null
          memory_type: string | null
          metadata: Json | null
          mood: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          weather: string | null
        }
        Insert: {
          attachment_urls?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          location?: string | null
          memory_date?: string | null
          memory_type?: string | null
          metadata?: Json | null
          mood?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          weather?: string | null
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          location?: string | null
          memory_date?: string | null
          memory_type?: string | null
          metadata?: Json | null
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          weather?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number | null
          avatar: string | null
          created_at: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          requested_time: string | null
          serial_no: number
          symptoms: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          requested_time?: string | null
          serial_no?: number
          symptoms?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          requested_time?: string | null
          serial_no?: number
          symptoms?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "Booked"
        | "Checked-in"
      document_type:
        | "medical_report"
        | "prescription"
        | "lab_result"
        | "xray"
        | "mri"
        | "ct_scan"
        | "other"
      gender_type: "Male" | "Female" | "Other"
      priority_level: "Low" | "Medium" | "High"
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
      appointment_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "Booked",
        "Checked-in",
      ],
      document_type: [
        "medical_report",
        "prescription",
        "lab_result",
        "xray",
        "mri",
        "ct_scan",
        "other",
      ],
      gender_type: ["Male", "Female", "Other"],
      priority_level: ["Low", "Medium", "High"],
    },
  },
} as const
