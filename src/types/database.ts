export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          partner1_name: string | null
          partner2_name: string | null
          wedding_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          partner1_name?: string | null
          partner2_name?: string | null
          wedding_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          partner1_name?: string | null
          partner2_name?: string | null
          wedding_date?: string | null
          updated_at?: string
        }
      }
      registries: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          story: string | null
          cover_image_url: string | null
          theme: string
          custom_colors: Json | null
          ceremony_date: string | null
          ceremony_location: string | null
          is_published: boolean
          plan: "free" | "premium"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          story?: string | null
          cover_image_url?: string | null
          theme?: string
          custom_colors?: Json | null
          ceremony_date?: string | null
          ceremony_location?: string | null
          is_published?: boolean
          plan?: "free" | "premium"
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          story?: string | null
          cover_image_url?: string | null
          theme?: string
          custom_colors?: Json | null
          ceremony_date?: string | null
          ceremony_location?: string | null
          is_published?: boolean
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          registry_id: string
          title: string
          description: string | null
          price: number
          image_url: string | null
          amount_collected: number
          is_funded: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          registry_id: string
          title: string
          description?: string | null
          price: number
          image_url?: string | null
          amount_collected?: number
          is_funded?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          price?: number
          image_url?: string | null
          amount_collected?: number
          is_funded?: boolean
          display_order?: number
        }
      }
      contributions: {
        Row: {
          id: string
          gift_id: string
          registry_id: string
          contributor_name: string
          contributor_email: string
          amount: number
          message: string | null
          stripe_payment_intent_id: string | null
          status: "pending" | "succeeded" | "failed"
          created_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          registry_id: string
          contributor_name: string
          contributor_email: string
          amount: number
          message?: string | null
          stripe_payment_intent_id?: string | null
          status?: "pending" | "succeeded" | "failed"
          created_at?: string
        }
        Update: {
          amount?: number
          message?: string | null
          stripe_payment_intent_id?: string | null
          status?: "pending" | "succeeded" | "failed"
        }
      }
    }
  }
}
