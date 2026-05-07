import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/morning', label: 'Morning' },
  { to: '/evening', label: 'Evening' },
  { to: '/privacy', label: 'Privacy' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="logo">
            <img src="/icon-192.png" alt="" className="logo-image" />
            <span className="logo-text">Adkar Champ</span>
          </Link>
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={location.pathname === item.to ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Adkar Champ · Built for the Ummah</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy</Link>
            <span>·</span>
            <Link to="/delete-account">Delete Account</Link>
            <span>·</span>
            <a
              href="https://github.com/zameel7/adkar-streak"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
