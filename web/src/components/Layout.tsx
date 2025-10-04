import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="logo">
            <img src="/icon.png" alt="Adkar Champ" className="logo-image" />
            <span className="logo-text">Adkar Champ</span>
          </Link>
          <div className="nav-links">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
            <Link 
              to="/privacy" 
              className={location.pathname === '/privacy' ? 'active' : ''}
            >
              Privacy
            </Link>
            <Link 
              to="/delete-account" 
              className={location.pathname === '/delete-account' ? 'active' : ''}
            >
              Delete Account
            </Link>
          </div>
        </div>
      </nav>
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-container">
          <p>© 2025 Adkar Champ. Built with ❤️ for the Ummah</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/delete-account">Delete Account</Link>
            <span>•</span>
            <a href="https://github.com/zameel7/adkar-streak" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

