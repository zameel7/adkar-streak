import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      adkar_streaks: {
        Row: {
          id: string
          user_id: string
          date: string
          morning: boolean
          evening: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          morning?: boolean
          evening?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          morning?: boolean
          evening?: boolean
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          name: string | null
          morning_time: string | null
          evening_time: string | null
          theme: string | null
          notifications_enabled: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          morning_time?: string | null
          evening_time?: string | null
          theme?: string | null
          notifications_enabled?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          morning_time?: string | null
          evening_time?: string | null
          theme?: string | null
          notifications_enabled?: boolean | null
        }
      }
    }
  }
}