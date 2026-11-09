import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './DeleteAccount.css'

type Status = 'checking' | 'ready' | 'invalid' | 'done'

/**
 * Landing page for the Supabase password-recovery email.
 * supabase-js picks the recovery token out of the URL (detectSessionInUrl)
 * and creates a temporary session; we then let the user set a new password.
 */
export default function ResetPassword() {
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Error from Supabase (e.g. expired link) arrives in the hash.
    const hash = new URLSearchParams(window.location.hash.slice(1))
    if (hash.get('error')) {
      setError(hash.get('error_description') ?? 'This reset link is invalid or has expired.')
      setStatus('invalid')
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setStatus('ready')
      }
    })

    // The session may already be set by the time we subscribe.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('ready')
    })

    const timer = setTimeout(() => {
      setStatus((s) => (s === 'checking' ? 'invalid' : s))
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await supabase.auth.signOut()
    setStatus('done')
  }

  return (
    <div className="delete-account">
      <div className="delete-container">
        <div className="delete-header">
          <h1>Reset Password</h1>
          <p className="subtitle">Choose a new password for your Adkar Champ account.</p>
        </div>

        <div className="delete-content">
          {status === 'checking' && <p className="subtitle">Verifying your reset link…</p>}

          {status === 'invalid' && (
            <div className="message error">
              {error ?? 'This reset link is invalid or has expired.'} Request a new one from the
              app: Sign in → Forgot password?
            </div>
          )}

          {status === 'done' && (
            <div className="message success">
              Your password has been updated. Open the Adkar Champ app and sign in with your new
              password.
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="delete-form">
              <div className="form-group">
                <label htmlFor="password">New password</label>
                <input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirm new password</label>
                <input
                  type="password"
                  id="confirm"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="message error">{error}</div>}

              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
