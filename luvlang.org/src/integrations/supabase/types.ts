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
      users: {
        Row: {
          id: string
          email: string | null
          phone_number: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          photo_verified: boolean
          photo_verified_at: string | null
          identity_verified: boolean
          identity_verified_at: string | null
          verification_photo_url: string | null
          identity_verification_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          photo_verified?: boolean
          photo_verified_at?: string | null
          identity_verified?: boolean
          identity_verified_at?: string | null
          verification_photo_url?: string | null
          identity_verification_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          photo_verified?: boolean
          photo_verified_at?: string | null
          identity_verified?: boolean
          identity_verified_at?: string | null
          verification_photo_url?: string | null
          identity_verification_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      phone_verifications: {
        Row: {
          id: string
          user_id: string | null
          phone_number: string
          verification_code: string
          created_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          phone_number: string
          verification_code: string
          created_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string | null
          phone_number?: string
          verification_code?: string
          created_at?: string | null
          expires_at?: string
        }
      }
      verification_documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          file_url: string
          verification_status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          file_url: string
          verification_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          file_url?: string
          verification_status?: string
          created_at?: string
        }
      }
      social_media_verifications: {
        Row: {
          id: string
          user_id: string
          platform: string
          profile_url: string
          verification_status: string
          created_at: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          profile_url: string
          verification_status?: string
          created_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          profile_url?: string
          verification_status?: string
          created_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}