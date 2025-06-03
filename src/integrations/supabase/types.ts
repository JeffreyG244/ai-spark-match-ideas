export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      matches: {
        Row: {
          compatibility: number
          created_at: string
          id: number
          matched_user_id: string
          status: Database["public"]["Enums"]["match_status"]
          user_id: string
        }
        Insert: {
          compatibility: number
          created_at?: string
          id?: never
          matched_user_id: string
          status?: Database["public"]["Enums"]["match_status"]
          user_id: string
        }
        Update: {
          compatibility?: number
          created_at?: string
          id?: never
          matched_user_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          id: number
          read: boolean
          receiver_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: never
          read?: boolean
          receiver_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: never
          read?: boolean
          receiver_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      password_history: {
        Row: {
          algorithm: string
          created_at: string | null
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          algorithm?: string
          created_at?: string | null
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          algorithm?: string
          created_at?: string | null
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: number
          metadata: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: never
          metadata?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: never
          metadata?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_blocks: {
        Row: {
          action: string
          blocked_until: string
          created_at: string
          id: number
          identifier: string
          request_count: number
        }
        Insert: {
          action?: string
          blocked_until: string
          created_at?: string
          id?: never
          identifier: string
          request_count?: number
        }
        Update: {
          action?: string
          blocked_until?: string
          created_at?: string
          id?: never
          identifier?: string
          request_count?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          id: number
          identifier: string
          timestamp: string
        }
        Insert: {
          action?: string
          id?: never
          identifier: string
          timestamp?: string
        }
        Update: {
          action?: string
          id?: never
          identifier?: string
          timestamp?: string
        }
        Relationships: []
      }
      security_configs: {
        Row: {
          created_at: string
          device_tracking: boolean
          id: number
          login_alerts: boolean
          privacy_settings: Json
          session_timeout: number
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_tracking?: boolean
          id?: never
          login_alerts?: boolean
          privacy_settings?: Json
          session_timeout?: number
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_tracking?: boolean
          id?: never
          login_alerts?: boolean
          privacy_settings?: Json
          session_timeout?: number
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: string | null
          event_type: string
          id: number
          identifier: string | null
          ip_address: string | null
          severity: Database["public"]["Enums"]["security_severity"]
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          event_type: string
          id?: never
          identifier?: string | null
          ip_address?: string | null
          severity?: Database["public"]["Enums"]["security_severity"]
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          event_type?: string
          id?: never
          identifier?: string | null
          ip_address?: string | null
          severity?: Database["public"]["Enums"]["security_severity"]
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string
          device_fingerprint: string
          id: number
          is_trusted: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          id?: never
          is_trusted?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          id?: never
          is_trusted?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          green_flags: string | null
          id: number
          life_goals: string | null
          photos: string[] | null
          updated_at: string
          user_id: string
          values: string | null
          verified: boolean
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          green_flags?: string | null
          id?: never
          life_goals?: string | null
          photos?: string[] | null
          updated_at?: string
          user_id: string
          values?: string | null
          verified?: boolean
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          green_flags?: string | null
          id?: never
          life_goals?: string | null
          photos?: string[] | null
          updated_at?: string
          user_id?: string
          values?: string | null
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_password_to_history: {
        Args: {
          p_user_id: string
          p_password_hash: string
          p_algorithm?: string
        }
        Returns: undefined
      }
      check_password_reuse: {
        Args: { p_user_id: string; p_new_password_hash: string }
        Returns: boolean
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_user_session: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      match_status: "pending" | "accepted" | "rejected"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      security_severity: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_status: ["pending", "accepted", "rejected"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      security_severity: ["low", "medium", "high", "critical"],
    },
  },
} as const
