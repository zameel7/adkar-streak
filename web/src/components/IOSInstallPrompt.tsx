import { useEffect, useState } from 'react'
import './IOSInstallPrompt.css'

const STORAGE_KEY = 'ios-install-prompt-dismissed'
const DISMISS_DAYS = 14

function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  // iPad on iOS 13+ reports "MacIntel" with touch support; cover that case too.
  const iPadOS13 =
    /Mac/.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadOS13
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  // Safari on iOS uses navigator.standalone; the rest use the display-mode media query.
  const nav = window.navigator as unknown as { standalone?: boolean }
  if (nav.standalone === true) return true
  return window.matchMedia('(display-mode: standalone)').matches
}

function wasRecentlyDismissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return false
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIOS()) return
    if (isStandalone()) return
    if (wasRecentlyDismissed()) return
    // Small delay so the banner doesn't flash in before the page renders.
    const t = setTimeout(() => setShow(true), 800)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // ignore — at worst the banner shows again next visit
    }
    setShow(false)
  }

  return (
    <div className="ios-install" role="dialog" aria-label="Install Adkar Champ">
      <div className="ios-install-card">
        <button
          className="ios-install-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <img
          src="/icon-192.png"
          alt=""
          className="ios-install-icon"
          width={48}
          height={48}
        />

        <div className="ios-install-body">
          <p className="ios-install-title">Install Adkar Champ</p>
          <p className="ios-install-step">
            Tap{' '}
            <span className="ios-install-glyph" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{' '}
            then <strong>Add to Home Screen</strong>.
          </p>
        </div>
      </div>
      <div className="ios-install-arrow" aria-hidden="true" />
    </div>
  )
}
