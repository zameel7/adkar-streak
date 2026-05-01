import { Session, User } from '@supabase/supabase-js'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const SUPABASE_NOT_CONFIGURED_ERROR = {
  name: 'SupabaseNotConfigured',
  message: 'Cloud sync isn\'t configured for this build. The app will keep working offline.',
}

type AuthProps = {
  user: User | null
  session: Session | null
  initialized?: boolean
  signIn?: (email: string, password: string) => Promise<{ error: any }>
  signUp?: (email: string, password: string) => Promise<{ error: any }>
  signOut?: () => Promise<void>
  loading?: boolean
}

export const AuthContext = createContext<Partial<AuthProps>>({})

// Custom hook to read the context values
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setInitialized(true)
      return () => {
        mounted = false
      }
    }

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
        } else {
          // Check if session is expired and try to refresh
          if (session && session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                if (mounted) {
                  setSession(null)
                  setUser(null)
                }
              } else {
                if (mounted) {
                  setSession(refreshData.session)
                  setUser(refreshData.session?.user ?? null)
                }
              }
            } catch (refreshErr) {
              if (mounted) {
                setSession(null)
                setUser(null)
              }
            }
          } else {
            if (mounted) {
              setSession(session)
              setUser(session?.user ?? null)
            }
          }
        }
      } catch (error) {
        console.error('Exception getting initial session:', error);
      } finally {
        if (mounted) {
          setInitialized(true)
        }
      }
    }

    getInitialSession()

    // Listen for changes to authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session ? session.user : null)
          setInitialized(true)
        }
      }
    )

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [])

  const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s. Check your internet connection or Supabase URL.`)), ms)
      ),
    ])
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: SUPABASE_NOT_CONFIGURED_ERROR }
    setLoading(true)
    try {
      const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }))
      return { error }
    } catch (e: any) {
      return { error: e }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: SUPABASE_NOT_CONFIGURED_ERROR }
    setLoading(true)
    try {
      const { error } = await withTimeout(supabase.auth.signUp({ email, password }))
      return { error }
    } catch (e: any) {
      return { error: e }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  const value = {
    user,
    session,
    initialized,
    signIn,
    signUp,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}