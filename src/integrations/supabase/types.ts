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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_icebreakers: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string | null
          effectiveness_rating: number | null
          generated_by: string | null
          icebreaker_text: string
          icebreaker_type: string | null
          id: string
          match_id: string | null
          match_score: number | null
          priority: number | null
          used_by_user: string | null
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          effectiveness_rating?: number | null
          generated_by?: string | null
          icebreaker_text: string
          icebreaker_type?: string | null
          id?: string
          match_id?: string | null
          match_score?: number | null
          priority?: number | null
          used_by_user?: string | null
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          effectiveness_rating?: number | null
          generated_by?: string | null
          icebreaker_text?: string
          icebreaker_type?: string | null
          id?: string
          match_id?: string | null
          match_score?: number | null
          priority?: number | null
          used_by_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_icebreakers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "executive_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_match_results: {
        Row: {
          compatibility_score: number | null
          created_at: string
          id: string
          match_recommendations: Json | null
          personality_analysis: Json | null
          processed_at: string | null
          processing_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_recommendations?: Json | null
          personality_analysis?: Json | null
          processed_at?: string | null
          processing_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_recommendations?: Json | null
          personality_analysis?: Json | null
          processed_at?: string | null
          processing_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          ai_suggested: boolean | null
          contact_info_shared: boolean | null
          content: string
          conversation_id: string | null
          created_at: string | null
          effectiveness_score: number | null
          id: string
          meeting_proposal: Json | null
          message_type: string | null
          read_at: string | null
          sender_id: string | null
          sentiment_score: number | null
        }
        Insert: {
          ai_suggested?: boolean | null
          contact_info_shared?: boolean | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          meeting_proposal?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
          sentiment_score?: number | null
        }
        Update: {
          ai_suggested?: boolean | null
          contact_info_shared?: boolean | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          meeting_proposal?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avg_response_time: unknown | null
          conversation_quality_score: number | null
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_id: string | null
          match_id: string | null
          message_count: number | null
          participant_1: string | null
          participant_2: string | null
        }
        Insert: {
          avg_response_time?: unknown | null
          conversation_quality_score?: number | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          match_id?: string | null
          message_count?: number | null
          participant_1?: string | null
          participant_2?: string | null
        }
        Update: {
          avg_response_time?: unknown | null
          conversation_quality_score?: number | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          match_id?: string | null
          message_count?: number | null
          participant_1?: string | null
          participant_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "executive_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_matches: {
        Row: {
          action: string | null
          action_at: string | null
          ai_confidence: number | null
          common_interests: string[] | null
          compatibility_score: number | null
          date: string | null
          id: string
          match_date: string | null
          match_factors: Json | null
          match_type: string | null
          networking_opportunity: boolean | null
          professional_highlight: string | null
          recommendation_reasons: string[] | null
          recommendation_score: number
          recommended_user_id: string | null
          status: string | null
          trending_reason: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          action_at?: string | null
          ai_confidence?: number | null
          common_interests?: string[] | null
          compatibility_score?: number | null
          date?: string | null
          id?: string
          match_date?: string | null
          match_factors?: Json | null
          match_type?: string | null
          networking_opportunity?: boolean | null
          professional_highlight?: string | null
          recommendation_reasons?: string[] | null
          recommendation_score: number
          recommended_user_id?: string | null
          status?: string | null
          trending_reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          action_at?: string | null
          ai_confidence?: number | null
          common_interests?: string[] | null
          compatibility_score?: number | null
          date?: string | null
          id?: string
          match_date?: string | null
          match_factors?: Json | null
          match_type?: string | null
          networking_opportunity?: boolean | null
          professional_highlight?: string | null
          recommendation_reasons?: string[] | null
          recommendation_score?: number
          recommended_user_id?: string | null
          status?: string | null
          trending_reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_matches_recommended_user_id_fkey"
            columns: ["recommended_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          profile_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          attended_at: string | null
          connections_made: number | null
          event_id: string | null
          id: string
          registered_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          attended_at?: string | null
          connections_made?: number | null
          event_id?: string | null
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          attended_at?: string | null
          connections_made?: number | null
          event_id?: string | null
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "networking_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_dating_profiles: {
        Row: {
          age: number | null
          age_range_max: number | null
          age_range_min: number | null
          attachment_style: string | null
          communication_style: string[] | null
          completed: boolean | null
          conflict_resolution_style: string | null
          core_values: string[] | null
          created_at: string
          cultural_interests: string[] | null
          deal_breakers: string[] | null
          distance_preference: number | null
          executive_title: string | null
          family_plans: string | null
          first_name: string | null
          id: string
          industry: string | null
          intellectual_pursuits: string[] | null
          interested_in_meeting: string[] | null
          languages_spoken: string[] | null
          last_name: string | null
          lifestyle_level: string | null
          living_arrangement: string | null
          love_languages: string[] | null
          myers_briggs_type: string | null
          photos: string[] | null
          political_views: string | null
          primary_location: string | null
          pronouns: string | null
          relationship_style: string | null
          religious_views: string | null
          sexual_orientation: string[] | null
          success_level: string | null
          updated_at: string
          user_id: string
          vacation_style: string[] | null
          voice_introduction: string | null
          weekend_activities: string[] | null
        }
        Insert: {
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          attachment_style?: string | null
          communication_style?: string[] | null
          completed?: boolean | null
          conflict_resolution_style?: string | null
          core_values?: string[] | null
          created_at?: string
          cultural_interests?: string[] | null
          deal_breakers?: string[] | null
          distance_preference?: number | null
          executive_title?: string | null
          family_plans?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          intellectual_pursuits?: string[] | null
          interested_in_meeting?: string[] | null
          languages_spoken?: string[] | null
          last_name?: string | null
          lifestyle_level?: string | null
          living_arrangement?: string | null
          love_languages?: string[] | null
          myers_briggs_type?: string | null
          photos?: string[] | null
          political_views?: string | null
          primary_location?: string | null
          pronouns?: string | null
          relationship_style?: string | null
          religious_views?: string | null
          sexual_orientation?: string[] | null
          success_level?: string | null
          updated_at?: string
          user_id: string
          vacation_style?: string[] | null
          voice_introduction?: string | null
          weekend_activities?: string[] | null
        }
        Update: {
          age?: number | null
          age_range_max?: number | null
          age_range_min?: number | null
          attachment_style?: string | null
          communication_style?: string[] | null
          completed?: boolean | null
          conflict_resolution_style?: string | null
          core_values?: string[] | null
          created_at?: string
          cultural_interests?: string[] | null
          deal_breakers?: string[] | null
          distance_preference?: number | null
          executive_title?: string | null
          family_plans?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          intellectual_pursuits?: string[] | null
          interested_in_meeting?: string[] | null
          languages_spoken?: string[] | null
          last_name?: string | null
          lifestyle_level?: string | null
          living_arrangement?: string | null
          love_languages?: string[] | null
          myers_briggs_type?: string | null
          photos?: string[] | null
          political_views?: string | null
          primary_location?: string | null
          pronouns?: string | null
          relationship_style?: string | null
          religious_views?: string | null
          sexual_orientation?: string[] | null
          success_level?: string | null
          updated_at?: string
          user_id?: string
          vacation_style?: string[] | null
          voice_introduction?: string | null
          weekend_activities?: string[] | null
        }
        Relationships: []
      }
      executive_matches: {
        Row: {
          best_conversation_starters: string[] | null
          common_interests: string[] | null
          communication_compatibility: number | null
          compatibility_score: number
          created_at: string | null
          id: string
          lifestyle_score: number | null
          match_reasons: string[] | null
          matched_user_action: string | null
          matched_user_action_at: string | null
          matched_user_id: string | null
          mutual_connections: number | null
          optimal_meeting_type: string | null
          personality_score: number | null
          potential_challenges: string[] | null
          professional_score: number | null
          relationship_potential: number | null
          relationship_timeline_prediction: string | null
          status: string | null
          success_probability: number | null
          user_action: string | null
          user_action_at: string | null
          user_id: string | null
          values_alignment_score: number | null
        }
        Insert: {
          best_conversation_starters?: string[] | null
          common_interests?: string[] | null
          communication_compatibility?: number | null
          compatibility_score: number
          created_at?: string | null
          id?: string
          lifestyle_score?: number | null
          match_reasons?: string[] | null
          matched_user_action?: string | null
          matched_user_action_at?: string | null
          matched_user_id?: string | null
          mutual_connections?: number | null
          optimal_meeting_type?: string | null
          personality_score?: number | null
          potential_challenges?: string[] | null
          professional_score?: number | null
          relationship_potential?: number | null
          relationship_timeline_prediction?: string | null
          status?: string | null
          success_probability?: number | null
          user_action?: string | null
          user_action_at?: string | null
          user_id?: string | null
          values_alignment_score?: number | null
        }
        Update: {
          best_conversation_starters?: string[] | null
          common_interests?: string[] | null
          communication_compatibility?: number | null
          compatibility_score?: number
          created_at?: string | null
          id?: string
          lifestyle_score?: number | null
          match_reasons?: string[] | null
          matched_user_action?: string | null
          matched_user_action_at?: string | null
          matched_user_id?: string | null
          mutual_connections?: number | null
          optimal_meeting_type?: string | null
          personality_score?: number | null
          potential_challenges?: string[] | null
          professional_score?: number | null
          relationship_potential?: number | null
          relationship_timeline_prediction?: string | null
          status?: string | null
          success_probability?: number | null
          user_action?: string | null
          user_action_at?: string | null
          user_id?: string | null
          values_alignment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_matches_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_categories: {
        Row: {
          color_gradient: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          color_gradient?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          color_gradient?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category_id: number | null
          created_at: string | null
          id: number
          is_premium: boolean | null
          name: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          is_premium?: boolean | null
          name: string
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          is_premium?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          match_data: Json | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_data?: Json | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_data?: Json | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      meeting_requests: {
        Row: {
          confirmed_date: string | null
          confirmed_location: string | null
          confirmed_time: string | null
          created_at: string | null
          duration_minutes: number | null
          follow_up_interest: boolean | null
          id: string
          location_type: string | null
          match_id: string | null
          meeting_notes: string | null
          meeting_rating: number | null
          meeting_type: string | null
          message: string | null
          proposed_date: string | null
          proposed_time: string | null
          recipient_id: string | null
          requester_id: string | null
          responded_at: string | null
          response_message: string | null
          status: string | null
          updated_at: string | null
          venue_suggestion: string | null
        }
        Insert: {
          confirmed_date?: string | null
          confirmed_location?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_interest?: boolean | null
          id?: string
          location_type?: string | null
          match_id?: string | null
          meeting_notes?: string | null
          meeting_rating?: number | null
          meeting_type?: string | null
          message?: string | null
          proposed_date?: string | null
          proposed_time?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
          venue_suggestion?: string | null
        }
        Update: {
          confirmed_date?: string | null
          confirmed_location?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_interest?: boolean | null
          id?: string
          location_type?: string | null
          match_id?: string | null
          meeting_notes?: string | null
          meeting_rating?: number | null
          meeting_type?: string | null
          message?: string | null
          proposed_date?: string | null
          proposed_time?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
          venue_suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "executive_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          annual_price: number | null
          concierge_access: boolean | null
          created_at: string | null
          features: Json
          id: number
          max_daily_matches: number | null
          max_monthly_meetings: number | null
          monthly_price: number
          name: string
          priority_support: boolean | null
          tier_level: number
        }
        Insert: {
          annual_price?: number | null
          concierge_access?: boolean | null
          created_at?: string | null
          features: Json
          id?: number
          max_daily_matches?: number | null
          max_monthly_meetings?: number | null
          monthly_price: number
          name: string
          priority_support?: boolean | null
          tier_level: number
        }
        Update: {
          annual_price?: number | null
          concierge_access?: boolean | null
          created_at?: string | null
          features?: Json
          id?: number
          max_daily_matches?: number | null
          max_monthly_meetings?: number | null
          monthly_price?: number
          name?: string
          priority_support?: boolean | null
          tier_level?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_events: {
        Row: {
          cost: number | null
          created_at: string | null
          date: string
          description: string | null
          dress_code: string | null
          end_time: string | null
          event_name: string
          event_type: string | null
          exclusivity_level: string | null
          id: string
          industry: string | null
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          start_time: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          event_name: string
          event_type?: string | null
          exclusivity_level?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          event_name?: string
          event_type?: string | null
          exclusivity_level?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "networking_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: unknown
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string | null
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number | null
          code_expires_at: string | null
          created_at: string | null
          id: string
          max_attempts: number | null
          phone_number: string
          updated_at: string | null
          user_id: string
          verification_code: string | null
          verification_code_hash: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code_expires_at?: string | null
          created_at?: string | null
          id?: string
          max_attempts?: number | null
          phone_number: string
          updated_at?: string | null
          user_id: string
          verification_code?: string | null
          verification_code_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code_expires_at?: string | null
          created_at?: string | null
          id?: string
          max_attempts?: number | null
          phone_number?: string
          updated_at?: string | null
          user_id?: string
          verification_code?: string | null
          verification_code_hash?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          after_hours_available: boolean | null
          ambition_level: number | null
          awards: string[] | null
          board_positions: string[] | null
          career_goals: string | null
          career_level: string | null
          certifications: string[] | null
          created_at: string | null
          equity_ownership: boolean | null
          id: string
          international_experience: boolean | null
          lunch_break_available: boolean | null
          management_role: boolean | null
          mentorship_interest: string | null
          networking_goals: string[] | null
          professional_achievements: string[] | null
          professional_interests: string[] | null
          publications: string[] | null
          remote_work_preference: string | null
          speaking_engagements: string[] | null
          startup_experience: boolean | null
          team_size: number | null
          travel_frequency: string | null
          typical_work_hours: string | null
          updated_at: string | null
          user_id: string | null
          work_life_balance_importance: number | null
          years_experience: number | null
        }
        Insert: {
          after_hours_available?: boolean | null
          ambition_level?: number | null
          awards?: string[] | null
          board_positions?: string[] | null
          career_goals?: string | null
          career_level?: string | null
          certifications?: string[] | null
          created_at?: string | null
          equity_ownership?: boolean | null
          id?: string
          international_experience?: boolean | null
          lunch_break_available?: boolean | null
          management_role?: boolean | null
          mentorship_interest?: string | null
          networking_goals?: string[] | null
          professional_achievements?: string[] | null
          professional_interests?: string[] | null
          publications?: string[] | null
          remote_work_preference?: string | null
          speaking_engagements?: string[] | null
          startup_experience?: boolean | null
          team_size?: number | null
          travel_frequency?: string | null
          typical_work_hours?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_life_balance_importance?: number | null
          years_experience?: number | null
        }
        Update: {
          after_hours_available?: boolean | null
          ambition_level?: number | null
          awards?: string[] | null
          board_positions?: string[] | null
          career_goals?: string | null
          career_level?: string | null
          certifications?: string[] | null
          created_at?: string | null
          equity_ownership?: boolean | null
          id?: string
          international_experience?: boolean | null
          lunch_break_available?: boolean | null
          management_role?: boolean | null
          mentorship_interest?: string | null
          networking_goals?: string[] | null
          professional_achievements?: string[] | null
          professional_interests?: string[] | null
          publications?: string[] | null
          remote_work_preference?: string | null
          speaking_engagements?: string[] | null
          startup_experience?: boolean | null
          team_size?: number | null
          travel_frequency?: string | null
          typical_work_hours?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_life_balance_importance?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_badges: {
        Row: {
          badge_name: string
          badge_type: string
          category: string | null
          description: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          user_id: string | null
          verification_required: boolean | null
        }
        Insert: {
          badge_name: string
          badge_type: string
          category?: string | null
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
          verification_required?: boolean | null
        }
        Update: {
          badge_name?: string
          badge_type?: string
          category?: string | null
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
          verification_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          auth_user_id: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          education: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          job_title: string | null
          last_name: string | null
          location: string | null
          membership_type: string | null
          photo_urls: string[] | null
          primary_photo_url: string | null
          profile_complete: boolean | null
          sexual_orientation: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          auth_user_id?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          membership_type?: string | null
          photo_urls?: string[] | null
          primary_photo_url?: string | null
          profile_complete?: boolean | null
          sexual_orientation?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          auth_user_id?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          membership_type?: string | null
          photo_urls?: string[] | null
          primary_photo_url?: string | null
          profile_complete?: boolean | null
          sexual_orientation?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          severity: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_verifications: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          profile_url: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          profile_url: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          profile_url?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          average_response_time: number | null
          conversation_quality_avg: number | null
          created_at: string | null
          date: string | null
          demand_level: string | null
          id: string
          market_rank_percentile: number | null
          matches_made: number | null
          meeting_success_rate: number | null
          meetings_completed: number | null
          meetings_scheduled: number | null
          messages_received: number | null
          messages_sent: number | null
          profile_likes: number | null
          profile_views: number | null
          response_rate: number | null
          trending_score: number | null
          user_id: string | null
        }
        Insert: {
          average_response_time?: number | null
          conversation_quality_avg?: number | null
          created_at?: string | null
          date?: string | null
          demand_level?: string | null
          id?: string
          market_rank_percentile?: number | null
          matches_made?: number | null
          meeting_success_rate?: number | null
          meetings_completed?: number | null
          meetings_scheduled?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          profile_likes?: number | null
          profile_views?: number | null
          response_rate?: number | null
          trending_score?: number | null
          user_id?: string | null
        }
        Update: {
          average_response_time?: number | null
          conversation_quality_avg?: number | null
          created_at?: string | null
          date?: string | null
          demand_level?: string | null
          id?: string
          market_rank_percentile?: number | null
          matches_made?: number | null
          meeting_success_rate?: number | null
          meetings_completed?: number | null
          meetings_scheduled?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          profile_likes?: number | null
          profile_views?: number | null
          response_rate?: number | null
          trending_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          id: number
          interest_id: number | null
          selected_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          interest_id?: number | null
          selected_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          interest_id?: number | null
          selected_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          private_data: Json | null
          public_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          private_data?: Json | null
          public_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          private_data?: Json | null
          public_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          plan_id: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          plan_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
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
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          background_check_verified: boolean | null
          background_check_verified_at: string | null
          company_verified: boolean | null
          company_verified_at: string | null
          created_at: string | null
          education_verified: boolean | null
          education_verified_at: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          id: string
          income_verified: boolean | null
          income_verified_at: string | null
          linkedin_verified: boolean | null
          linkedin_verified_at: string | null
          phone_number: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          photo_verified: boolean | null
          photo_verified_at: string | null
          social_media_verified: boolean | null
          social_media_verified_at: string | null
          updated_at: string | null
          user_id: string | null
          verification_documents: Json | null
          verification_notes: string | null
          video_verified: boolean | null
          video_verified_at: string | null
        }
        Insert: {
          background_check_verified?: boolean | null
          background_check_verified_at?: string | null
          company_verified?: boolean | null
          company_verified_at?: string | null
          created_at?: string | null
          education_verified?: boolean | null
          education_verified_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          income_verified?: boolean | null
          income_verified_at?: string | null
          linkedin_verified?: boolean | null
          linkedin_verified_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          social_media_verified?: boolean | null
          social_media_verified_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          video_verified?: boolean | null
          video_verified_at?: string | null
        }
        Update: {
          background_check_verified?: boolean | null
          background_check_verified_at?: string | null
          company_verified?: boolean | null
          company_verified_at?: string | null
          created_at?: string | null
          education_verified?: boolean | null
          education_verified_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          income_verified?: boolean | null
          income_verified_at?: string | null
          linkedin_verified?: boolean | null
          linkedin_verified_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          social_media_verified?: boolean | null
          social_media_verified_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          video_verified?: boolean | null
          video_verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          after_work_dates: boolean | null
          age: number | null
          age_max: number | null
          age_min: number | null
          average_response_time_minutes: number | null
          bio: string | null
          city: string
          company: string | null
          company_email: string | null
          country: string | null
          created_at: string | null
          cultural_interests: string[] | null
          current_mood: string | null
          currently_reading: string | null
          date_of_birth: string
          deal_breakers: string[] | null
          demand_level: string | null
          dietary_preferences: string[] | null
          education_level: string | null
          email: string
          family_goals: string | null
          first_name: string
          fitness_level: string | null
          gender: string | null
          graduation_year: number | null
          hobbies: string[] | null
          id: string
          industry: string | null
          interests: string[] | null
          investment_interests: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          job_title: string | null
          languages: string[] | null
          last_active: string | null
          last_name: string
          latitude: number | null
          lifestyle_preference: string | null
          linkedin_url: string | null
          longitude: number | null
          looking_for: string | null
          love_language: string | null
          lunch_meetings: boolean | null
          luxury_preferences: string[] | null
          market_rank_percentile: number | null
          max_distance: number | null
          membership_verification:
            | Database["public"]["Enums"]["membership_verification_level"]
            | null
          music_taste: string[] | null
          networking_events: boolean | null
          perfect_date: string | null
          personality_traits: string[] | null
          phone_number: string | null
          photos: string[] | null
          photos_updated_at: string | null
          preferred_industries: string[] | null
          primary_photo_url: string | null
          profile_views: number | null
          response_rate: number | null
          salary_range: string | null
          social_causes: string[] | null
          state: string | null
          stress_level: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          travel_schedule: string | null
          trending_score: number | null
          university: string | null
          updated_at: string | null
          verification_date: string | null
          verification_types: string[] | null
          weekend_availability: boolean | null
          work_location: string | null
          work_schedule: string | null
        }
        Insert: {
          after_work_dates?: boolean | null
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          average_response_time_minutes?: number | null
          bio?: string | null
          city: string
          company?: string | null
          company_email?: string | null
          country?: string | null
          created_at?: string | null
          cultural_interests?: string[] | null
          current_mood?: string | null
          currently_reading?: string | null
          date_of_birth: string
          deal_breakers?: string[] | null
          demand_level?: string | null
          dietary_preferences?: string[] | null
          education_level?: string | null
          email: string
          family_goals?: string | null
          first_name: string
          fitness_level?: string | null
          gender?: string | null
          graduation_year?: number | null
          hobbies?: string[] | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          investment_interests?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_name: string
          latitude?: number | null
          lifestyle_preference?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          looking_for?: string | null
          love_language?: string | null
          lunch_meetings?: boolean | null
          luxury_preferences?: string[] | null
          market_rank_percentile?: number | null
          max_distance?: number | null
          membership_verification?:
            | Database["public"]["Enums"]["membership_verification_level"]
            | null
          music_taste?: string[] | null
          networking_events?: boolean | null
          perfect_date?: string | null
          personality_traits?: string[] | null
          phone_number?: string | null
          photos?: string[] | null
          photos_updated_at?: string | null
          preferred_industries?: string[] | null
          primary_photo_url?: string | null
          profile_views?: number | null
          response_rate?: number | null
          salary_range?: string | null
          social_causes?: string[] | null
          state?: string | null
          stress_level?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          travel_schedule?: string | null
          trending_score?: number | null
          university?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_types?: string[] | null
          weekend_availability?: boolean | null
          work_location?: string | null
          work_schedule?: string | null
        }
        Update: {
          after_work_dates?: boolean | null
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          average_response_time_minutes?: number | null
          bio?: string | null
          city?: string
          company?: string | null
          company_email?: string | null
          country?: string | null
          created_at?: string | null
          cultural_interests?: string[] | null
          current_mood?: string | null
          currently_reading?: string | null
          date_of_birth?: string
          deal_breakers?: string[] | null
          demand_level?: string | null
          dietary_preferences?: string[] | null
          education_level?: string | null
          email?: string
          family_goals?: string | null
          first_name?: string
          fitness_level?: string | null
          gender?: string | null
          graduation_year?: number | null
          hobbies?: string[] | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          investment_interests?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_name?: string
          latitude?: number | null
          lifestyle_preference?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          looking_for?: string | null
          love_language?: string | null
          lunch_meetings?: boolean | null
          luxury_preferences?: string[] | null
          market_rank_percentile?: number | null
          max_distance?: number | null
          membership_verification?:
            | Database["public"]["Enums"]["membership_verification_level"]
            | null
          music_taste?: string[] | null
          networking_events?: boolean | null
          perfect_date?: string | null
          personality_traits?: string[] | null
          phone_number?: string | null
          photos?: string[] | null
          photos_updated_at?: string | null
          preferred_industries?: string[] | null
          primary_photo_url?: string | null
          profile_views?: number | null
          response_rate?: number | null
          salary_range?: string | null
          social_causes?: string[] | null
          state?: string | null
          stress_level?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          travel_schedule?: string | null
          trending_score?: number | null
          university?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_types?: string[] | null
          weekend_availability?: boolean | null
          work_location?: string | null
          work_schedule?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      public_profiles_safe: {
        Row: {
          created_at: string | null
          id: string | null
          public_data: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          public_data?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          public_data?: Json | null
        }
        Relationships: []
      }
      user_interests_view: {
        Row: {
          category_name: string | null
          color_gradient: string | null
          interest_id: number | null
          interest_name: string | null
          is_premium: boolean | null
          selected_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      analyze_and_match: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: Json
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_compatibility_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      call_n8n_webhook: {
        Args:
          | Record<PropertyKey, never>
          | { p_headers?: Json; p_payload?: Json; p_workflow_id: string }
          | { webhook_url: string }
        Returns: Json
      }
      can_send_message: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      check_https: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      clean_orphaned_photos: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
        Args: { p_amount: number; p_currency: string; p_user_id: string }
        Returns: Json
      }
      create_user_profile_manually: {
        Args: { email: string; user_id: string }
        Returns: undefined
      }
      delete_profile_photo: {
        Args:
          | Record<PropertyKey, never>
          | { p_user_id: string }
          | { photo_url: string }
          | { photo_url: string; user_uuid: string }
        Returns: string[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      example_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_compatible_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_similar_users: {
        Args: { match_count?: number; user_uuid: string }
        Returns: {
          matched_user_id: string
          similarity_score: number
        }[]
      }
      force_https: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_compatible_matches: {
        Args: { match_limit?: number; target_user_id: string }
        Returns: {
          compatibility_score: number
          match_factors: Json
          recommended_user_id: string
          user_id: string
        }[]
      }
      generate_daily_matches: {
        Args: { match_count?: number; target_user_id: string }
        Returns: undefined
      }
      generate_daily_matches_for_user: {
        Args: {
          input_lat: number
          input_lng: number
          match_limit?: number
          max_distance?: number
          source_profile_id: string
        }
        Returns: undefined
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_db_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_image_dimensions: {
        Args: { "": string }
        Returns: {
          height: number
          width: number
        }[]
      }
      get_nearby_profiles: {
        Args:
          | { input_lat: number; input_lng: number; max_distance?: number }
          | {
              input_lat: number
              input_lng: number
              max_distance?: number
              result_limit?: number
              result_offset?: number
            }
          | { latitude: number; longitude: number; max_distance: number }
        Returns: {
          age: number
          distance_meters: number
          first_name: string
          gender: string
          id: string
          location: string
          profile_image_url: string
        }[]
      }
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_profile_by_user_id: {
        Args:
          | { input_user_id: string }
          | { user_id: number }
          | { user_id_input: unknown }
        Returns: Json
      }
      get_profile_user_id_as_uuid: {
        Args: { user_id: number }
        Returns: string
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_secure_photo_url: {
        Args:
          | Record<PropertyKey, never>
          | { filename: string }
          | { p_user_id: string }
        Returns: string
      }
      get_top_matches: {
        Args: { match_limit?: number; profile: string }
        Returns: {
          match_age: number
          match_bio: string
          match_first_name: string
          match_gender: string
          match_id: string
          match_image: string
          match_interests: string[]
          match_location: string
          score: number
        }[]
      }
      get_user_gender_preference: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_membership_level: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["membership_verification_level"]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      handle_paypal_webhook: {
        Args: { p_webhook_event: Json }
        Returns: undefined
      }
      handle_spatial_warning: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: { check_user_id: string; role_name: string }
        Returns: boolean
      }
      hash_verification_code: {
        Args: { code: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_higher: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_gender_compatible: {
        Args:
          | { target_gender: string; user_id: string }
          | { user1_id: string; user2_id: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_profile_filter: {
        Args: { current_user_id: string }
        Returns: {
          matching_profile_id: string
        }[]
      }
      match_suggestions_user_id_to_uuid: {
        Args: { user_id: number }
        Returns: string
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      run_security_diagnostics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      sanitize_and_validate_input: {
        Args: { content_type?: string; input_text: string; max_length?: number }
        Returns: Json
      }
      sanitize_user_input: {
        Args: { input_text: string; max_length?: number }
        Returns: string
      }
      search_products: {
        Args:
          | { max_results?: number; search_term?: string }
          | { query: string; table_name: string; vector_column: string }
        Returns: {
          description: string
          product_id: number
          product_name: string
        }[]
      }
      secure_rate_limit_check: {
        Args: {
          action_type?: string
          max_requests?: number
          user_id_param: string
          window_minutes?: number
        }
        Returns: Json
      }
      seed_dating_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      seed_diverse_dating_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          message: string
          success: boolean
        }[]
      }
      send_n8n_webhook: {
        Args: { payload: Json; webhook_url?: string }
        Returns: Json
      }
      setup_default_admin: {
        Args: { admin_email: string }
        Returns: undefined
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      suppress_spatial_warning: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upload_profile_photo: {
        Args:
          | Record<PropertyKey, never>
          | { file_data: string; file_name: string; user_id: string }
          | { file_name: string; file_path: string; user_id: string }
          | { new_photo_url: string; user_uuid: string }
          | { p_content_type: string; p_photo_data: string; p_user_id: string }
        Returns: undefined
      }
      upsert_user_presence: {
        Args: { p_is_online: boolean; p_user_id: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_password_with_leak_check: {
        Args: { password: string }
        Returns: Json
      }
      view_nearby_matches: {
        Args: { p_profile_id: number }
        Returns: {
          distance_meters: number
          matched_profile_id: number
          name: string
        }[]
      }
    }
    Enums: {
      gender_type: "male" | "female" | "non-binary" | "other"
      membership_verification_level:
        | "basic"
        | "premium"
        | "executive"
        | "c_suite"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      security_severity: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      gender_type: ["male", "female", "non-binary", "other"],
      membership_verification_level: [
        "basic",
        "premium",
        "executive",
        "c_suite",
      ],
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
