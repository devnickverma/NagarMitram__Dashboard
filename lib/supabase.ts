import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure a single Supabase client instance across HMR/SSR
const globalForSupabase = globalThis as unknown as { supabase?: ReturnType<typeof createClient> };

export const supabase =
  globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseAnonKey);

if (!globalForSupabase.supabase) {
  globalForSupabase.supabase = supabase;
}

// Database types (you can generate these from Supabase)
export interface Database {
  public: {
    Tables: {
      issues: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          status: 'pending' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'critical';
          location: {
            lat: number;
            lng: number;
            address?: string;
          };
          images?: string[];
          user_id: string;
          user_name: string;
          user_email: string;
          assigned_to?: string;
          resolved_at?: string;
          created_at: string;
          updated_at: string;
          votes?: number;
          comments_count?: number;
        };
        Insert: Omit<Database['public']['Tables']['issues']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['issues']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          issue_id: string;
          user_id: string;
          user_name: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'issue_status' | 'comment' | 'assignment' | 'system';
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}