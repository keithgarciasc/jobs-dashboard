import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('jobWranglerAuth');
    localStorage.removeItem('jobWranglerUser');
    navigate('/login');
    closeMenu();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const username = localStorage.getItem('jobWranglerUser') || 'Cowpoke';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          JOB WRANGLER
        </Link>

        <button className="hamburger" onClick={toggleMenu}>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Hunt Bounties
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/applied"
              className={`nav-link ${isActive('/applied') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              My Trail
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/recommended"
              className={`nav-link ${isActive('/recommended') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Wanted Board
            </Link>
          </li>
          <li className="nav-item nav-divider"></li>
          <li className="nav-item nav-user">
            <span className="nav-username">🤠 {username}</span>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-btn">
              Ride Off 🌅
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
