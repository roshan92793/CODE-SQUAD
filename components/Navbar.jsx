import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('skillsync_user');

  const handleSignOut = () => {
    localStorage.removeItem('skillsync_user');
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="container navbar flex items-center justify-between">
        <Link to="/" className="brand flex items-center gap-2">
          <Activity size={28} color="var(--accent-secondary)" />
          <h2>Skill<span className="text-gradient">Sync</span></h2>
        </Link>
        
        <nav className="nav-links flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it Works</a>
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link active">Dashboard</Link>
              <button onClick={handleSignOut} className="nav-link">Sign Out</button>
            </>
          )}
        </nav>

        <button className="mobile-menu btn-icon">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
