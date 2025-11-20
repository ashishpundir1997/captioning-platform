// Generated types from Supabase schema
// These will be auto-generated after you create your tables in Supabase

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
      videos: {
        Row: {
          id: string
          user_id: string | null
          original_filename: string
          storage_path: string
          file_size: number | null
          duration: number | null
          mime_type: string | null
          status: 'uploaded' | 'transcribing' | 'transcribed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          original_filename: string
          storage_path: string
          file_size?: number | null
          duration?: number | null
          mime_type?: string | null
          status?: 'uploaded' | 'transcribing' | 'transcribed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          original_filename?: string
          storage_path?: string
          file_size?: number | null
          duration?: number | null
          mime_type?: string | null
          status?: 'uploaded' | 'transcribing' | 'transcribed' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      captions: {
        Row: {
          id: string
          video_id: string
          caption_data: Json
          style: 'bottom' | 'top' | 'karaoke'
          language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          caption_data: Json
          style?: 'bottom' | 'top' | 'karaoke'
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          caption_data?: Json
          style?: 'bottom' | 'top' | 'karaoke'
          language?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          video_id: string
          caption_id: string
          storage_path: string
          file_size: number | null
          status: 'queued' | 'rendering' | 'completed' | 'failed'
          error_message: string | null
          render_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          caption_id: string
          storage_path: string
          file_size?: number | null
          status?: 'queued' | 'rendering' | 'completed' | 'failed'
          error_message?: string | null
          render_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          caption_id?: string
          storage_path?: string
          file_size?: number | null
          status?: 'queued' | 'rendering' | 'completed' | 'failed'
          error_message?: string | null
          render_time?: number | null
          created_at?: string
          updated_at?: string
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
      video_status: 'uploaded' | 'transcribing' | 'transcribed' | 'error'
      caption_style: 'bottom' | 'top' | 'karaoke'
      export_status: 'queued' | 'rendering' | 'completed' | 'failed'
    }
  }
}
