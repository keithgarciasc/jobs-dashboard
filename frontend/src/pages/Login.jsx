import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const motivationalQuotes = [
    "Every cowboy was once a greenhorn - time to saddle up!",
    "The gold rush of opportunity awaits, partner!",
    "Your next adventure starts at the hitching post!",
    "Winners never quit the trail - let's ride!",
    "Fortune favors the bold bounty hunter!",
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Hold up there, partner! Fill in both fields!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Invalid credentials, partner!');
        return;
      }

      const data = await response.json();

      // Store auth info
      localStorage.setItem('jobWranglerAuth', 'authenticated');
      localStorage.setItem('jobWranglerUserId', data.user.id);
      localStorage.setItem('jobWranglerUser', data.user.displayName);
      localStorage.setItem('jobWranglerIsGuest', data.user.isGuest);

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error - check if backend is running!');
    }
  };

  const handleGuestAccess = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'guest', password: 'guest' }),
      });

      if (!response.ok) {
        setError('Guest access unavailable!');
        return;
      }

      const data = await response.json();

      // Store auth info
      localStorage.setItem('jobWranglerAuth', 'guest');
      localStorage.setItem('jobWranglerUserId', data.user.id);
      localStorage.setItem('jobWranglerUser', data.user.displayName);
      localStorage.setItem('jobWranglerIsGuest', 'true');

      navigate('/');
    } catch (err) {
      console.error('Guest login error:', err);
      setError('Connection error - check if backend is running!');
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="tumbleweed tumbleweed-1">🌾</div>
        <div className="tumbleweed tumbleweed-2">🌾</div>
        <div className="tumbleweed tumbleweed-3">🌾</div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="sheriff-badge">⭐</div>
          <h1 className="login-title">Job Wrangler</h1>
          <p className="login-subtitle">Welcome to the Frontier, Partner!</p>
          <div className="login-quote">{randomQuote}</div>
        </div>

        <div className="login-card">
          <div className="wanted-poster-header">
            <h2>🤠 ENTER THE SALOON 🤠</h2>
            <p>Show your credentials, stranger!</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">
                <span className="label-icon">🎯</span>
                Your Handle (Username)
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your cowboy name..."
                className="login-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔐</span>
                Secret Code (Password)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secret code..."
                className="login-input"
              />
            </div>

            <button type="submit" className="login-btn">
              🐎 Ride Into Town
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button onClick={handleGuestAccess} className="guest-btn">
            🌵 Enter as Guest Cowpoke
          </button>

          <div className="login-footer">
            <p className="footer-text">
              🏜️ New to these parts? No problem! Just mosey on in as a guest!
            </p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">📌</span>
            <h3>Track Your Bounties</h3>
            <p>Keep tabs on every job you've applied to</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <h3>Discover Opportunities</h3>
            <p>Find the perfect bounties for your skills</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⭐</span>
            <h3>Claim Your Victory</h3>
            <p>Land that dream job and ride into the sunset</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
