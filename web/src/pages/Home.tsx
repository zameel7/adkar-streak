import './Home.css'

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

        <div className="hero-container">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Daily Islamic Remembrance
          </span>
          <h1 className="hero-title">
            Remember Allah,
            <br />
            <span className="gradient-text">build your streak.</span>
          </h1>
          <p className="hero-description">
            A quiet, focused space for your morning and evening adkar.
            Authentic supplications from Hisnul Muslim, gentle reminders,
            and a streak that grows with you.
          </p>
          <div className="hero-buttons">
            <a
              href="https://play.google.com/store/apps/details?id=com.zameel7.adkarstreak"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Get on Google Play</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="https://github.com/zameel7/adkar-streak"
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-container">
          <div className="section-head">
            <span className="section-eyebrow">What's inside</span>
            <h2 className="section-title">Built for the daily habit.</h2>
          </div>

          <div className="features-bento">
            <article className="bento-card bento-primary">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Morning &amp; Evening adkar</h3>
              <p>
                The full set from Hisnul Muslim, in Arabic with English translation.
                Read at your own pace, mark each one as done.
              </p>
            </article>

            <article className="bento-card">
              <div className="bento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l1.5 4.5L18 8l-3 3 1 5-4-2-4 2 1-5-3-3 4.5-1.5L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Streak tracking</h3>
              <p>Stay motivated with a streak that resets honestly when you miss a day.</p>
            </article>

            <article className="bento-card">
              <div className="bento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 8a6 6 0 0112 0v5l1.5 3h-15L6 13V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Gentle reminders</h3>
              <p>Customize morning and evening notification times. They nudge, never nag.</p>
            </article>

            <article className="bento-card">
              <div className="bento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Light &amp; dark</h3>
              <p>Comfortable reading at any hour. Theme follows your preference.</p>
            </article>

            <article className="bento-card">
              <div className="bento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              </div>
              <h3>Arabic &amp; translation</h3>
              <p>Toggle translations on or off depending on how you prefer to read.</p>
            </article>

            <article className="bento-card">
              <div className="bento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 19V8M10 19V4M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Progress at a glance</h3>
              <p>A 7-day strip and streak count keep you in touch with your habit.</p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-container">
          <h2>Begin today.</h2>
          <p>A few minutes of remembrance, every morning and every evening.</p>
          <a
            href="https://play.google.com/store/apps/details?id=com.zameel7.adkarstreak"
            className="btn btn-primary btn-large"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Now
          </a>
          <p className="cta-support">
            <a
              href="https://www.buymeacoffee.com/zameel7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support the project →
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
