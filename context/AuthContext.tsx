import React, { useState, useEffect, createContext, PropsWithChildren } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { router } from 'expo-router'

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

    // Get initial session
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

          // Only redirect after a slight delay to ensure state has updated
          setTimeout(() => {
            if (mounted) {
              router.replace(session ? '/(tabs)/home' : '/auth')
            }
          }, 100);
        }
      }
    )

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    return { error }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    return { error }
  }

  // Sign out the user
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