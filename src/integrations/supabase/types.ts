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
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          ip_address: unknown | null
          target_resource: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown | null
          target_resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown | null
          target_resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      compatibility_answers: {
        Row: {
          answers: Json
          completed_at: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      membership_plans: {
        Row: {
          annual_price: number | null
          created_at: string | null
          features: Json
          highlight_color: string | null
          id: number
          is_popular: boolean | null
          monthly_price: number
          name: string
          paypal_plan_id: string | null
        }
        Insert: {
          annual_price?: number | null
          created_at?: string | null
          features: Json
          highlight_color?: string | null
          id?: number
          is_popular?: boolean | null
          monthly_price: number
          name: string
          paypal_plan_id?: string | null
        }
        Update: {
          annual_price?: number | null
          created_at?: string | null
          features?: Json
          highlight_color?: string | null
          id?: number
          is_popular?: boolean | null
          monthly_price?: number
          name?: string
          paypal_plan_id?: string | null
        }
        Relationships: []
      }
      message_rate_limits: {
        Row: {
          id: string
          last_message_at: string
          message_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          id?: string
          last_message_at?: string
          message_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          id?: string
          last_message_at?: string
          message_count?: number
          user_id?: string
          window_start?: string
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
      paypal_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          paypal_order_id: string
          paypal_payer_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paypal_order_id: string
          paypal_payer_id?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paypal_order_id?: string
          paypal_payer_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          id?: never
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          id?: never
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
      rate_limit_rules: {
        Row: {
          created_at: string
          endpoint_pattern: string
          id: string
          max_penalty_duration: number
          max_requests: number
          penalty_multiplier: number
          rule_name: string
          updated_at: string
          window_seconds: number
        }
        Insert: {
          created_at?: string
          endpoint_pattern: string
          id?: string
          max_penalty_duration?: number
          max_requests?: number
          penalty_multiplier?: number
          rule_name: string
          updated_at?: string
          window_seconds?: number
        }
        Update: {
          created_at?: string
          endpoint_pattern?: string
          id?: string
          max_penalty_duration?: number
          max_requests?: number
          penalty_multiplier?: number
          rule_name?: string
          updated_at?: string
          window_seconds?: number
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
      security_logs: {
        Row: {
          created_at: string
          details: Json
          event_type: string
          fingerprint: string | null
          id: string
          ip_address: unknown | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          event_type: string
          fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          event_type?: string
          fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity?: string
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
      user_presence: {
        Row: {
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          updated_at?: string
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
          interests: string[] | null
          life_goals: string | null
          personality_answers: Json | null
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
          interests?: string[] | null
          life_goals?: string | null
          personality_answers?: Json | null
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
          interests?: string[] | null
          life_goals?: string | null
          personality_answers?: Json | null
          photos?: string[] | null
          updated_at?: string
          user_id?: string
          values?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          current_period_end: string | null
          payment_amount: number | null
          payment_currency: string | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          plan_id: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_security_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_paypal_payment: {
        Args: { p_user_id: string; p_amount: number; p_currency: string }
        Returns: Json
      }
      example_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_paypal_webhook: {
        Args: { p_webhook_event: Json }
        Returns: undefined
      }
      has_role: {
        Args: {
          check_user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin_or_higher: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      secure_rate_limit_check: {
        Args: {
          p_user_id: string
          p_action: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      upsert_user_presence: {
        Args: { p_user_id: string; p_is_online: boolean }
        Returns: undefined
      }
      validate_password_sec: {
        Args: { password: string }
        Returns: boolean
      }
      validate_password_security: {
        Args: { password: string }
        Returns: boolean
      }
      validate_role_assignment: {
        Args: {
          assigner_id: string
          target_user_id: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
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
      user_role: "user" | "moderator" | "admin" | "super_admin"
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
      user_role: ["user", "moderator", "admin", "super_admin"],
    },
  },
} as const
