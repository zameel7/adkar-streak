import { Link } from 'react-router-dom'
import './PwaHome.css'

export default function PwaHome() {
  return (
    <div className="pwa-home">
      <header className="pwa-header">
        <p className="pwa-greeting">Assalamu alaikum</p>
        <h1 className="pwa-title">Choose your adkar</h1>
      </header>

      <div className="pwa-cards">
        <Link to="/morning" className="pwa-card pwa-card-morning">
          <span className="pwa-card-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <div className="pwa-card-body">
            <span className="pwa-card-eyebrow">Morning</span>
            <span className="pwa-card-title">Morning Adkar</span>
            <span className="pwa-card-cta">
              Start
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </Link>

        <Link to="/evening" className="pwa-card pwa-card-evening">
          <span className="pwa-card-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </span>
          <div className="pwa-card-body">
            <span className="pwa-card-eyebrow">Evening</span>
            <span className="pwa-card-title">Evening Adkar</span>
            <span className="pwa-card-cta">
              Start
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
