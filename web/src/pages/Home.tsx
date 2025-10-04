import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-icon">🌙</span>
            Daily Islamic Remembrance
          </div>
          <h1 className="hero-title">
            Remember Allah with
            <br />
            <span className="gradient-text">Adkar Champ</span>
          </h1>
          <p className="hero-description">
            Track your daily morning and evening adkar with beautiful reminders.
            Build streaks, stay motivated, and strengthen your spiritual connection.
          </p>
          <div className="hero-buttons">
            <a 
              href="https://play.google.com/store/apps/details?id=com.zameel7.adkarstreak"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download on Google Play
            </a>
            <a 
              href="https://github.com/zameel7/adkar-streak"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌅</div>
              <h3>Morning & Evening Adkar</h3>
              <p>Access authentic morning and evening remembrances from Hisnul Muslim</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Streak Tracking</h3>
              <p>Stay motivated by maintaining your daily adkar streaks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Reminders</h3>
              <p>Never miss your adkar with customizable notification times</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌙</div>
              <h3>Dark Mode</h3>
              <p>Beautiful light and dark themes for comfortable reading</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Arabic & Translation</h3>
              <p>Read adkar in Arabic with English translations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your spiritual journey with detailed statistics</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <h2>Start Your Spiritual Journey Today</h2>
          <p>Join thousands of Muslims building a consistent adkar habit</p>
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
              Support the project ☕
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

