import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AppliedJobs from './pages/AppliedJobs';
import RecommendedJobs from './pages/RecommendedJobs';
import Login from './pages/Login';

// Protected Route component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('jobWranglerAuth');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navigation />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/recommended" element={<RecommendedJobs />} />
                  <Route path="/applied" element={<AppliedJobs />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
