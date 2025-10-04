import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './DeleteAccount.css'

export default function DeleteAccount() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Sign in the user first to verify credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error('Invalid email or password')
      }

      if (!signInData.user) {
        throw new Error('User not found')
      }

      const userId = signInData.user.id

      // Delete user data from custom tables
      const { error: deleteStreaksError } = await supabase
        .from('adkar_streaks')
        .delete()
        .eq('user_id', userId)

      if (deleteStreaksError) {
        console.error('Error deleting streaks:', deleteStreaksError)
      }

      const { error: deletePreferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (deletePreferencesError) {
        console.error('Error deleting preferences:', deletePreferencesError)
      }

      // Sign out the user
      await supabase.auth.signOut()

      setMessage({
        type: 'success',
        text: 'Your account data has been deleted successfully. To complete the account deletion, please contact support or delete your account from the app settings.',
      })
      setEmail('')
      setPassword('')
      setShowConfirm(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while deleting your account',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <div className="delete-account">
      <div className="delete-container">
        <div className="delete-header">
          <div className="warning-icon">⚠️</div>
          <h1>Delete Account</h1>
          <p className="subtitle">
            This action will permanently delete your account data including streaks and preferences
          </p>
        </div>

        <div className="delete-content">
          <div className="info-box">
            <h3>What will be deleted:</h3>
            <ul>
              <li>Your user profile and preferences</li>
              <li>All your adkar streaks and progress</li>
              <li>Notification settings</li>
              <li>Any personalized data</li>
            </ul>
            <p className="info-note">
              <strong>Note:</strong> This action cannot be undone. Please make sure you want to proceed.
            </p>
          </div>

          <form onSubmit={handleDeleteAccount} className="delete-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {showConfirm && (
              <div className="confirm-box">
                <p>Are you absolutely sure? This action cannot be undone.</p>
              </div>
            )}

            <div className="button-group">
              {showConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Delete Account'}
                </button>
              )}
            </div>
          </form>

          <div className="help-text">
            <p>
              Need help? <a href="https://github.com/zameel7/adkar-streak/issues" target="_blank" rel="noopener noreferrer">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

