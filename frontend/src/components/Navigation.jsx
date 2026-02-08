import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

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
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
