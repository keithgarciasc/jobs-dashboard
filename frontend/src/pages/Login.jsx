import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple authentication (you can enhance this later)
    if (username && password) {
      // Store auth token (simple version)
      localStorage.setItem('jobWranglerAuth', 'authenticated');
      localStorage.setItem('jobWranglerUser', username);
      navigate('/');
    } else {
      setError('Hold up there, partner! Fill in both fields!');
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem('jobWranglerAuth', 'guest');
    localStorage.setItem('jobWranglerUser', 'Guest Cowpoke');
    navigate('/');
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
