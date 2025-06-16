export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          college: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          college: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          college?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          college: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          college?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          college?: string | null
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
