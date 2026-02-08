import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AppliedJobs from './pages/AppliedJobs';
import RecommendedJobs from './pages/RecommendedJobs';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommended" element={<RecommendedJobs />} />
          <Route path="/applied" element={<AppliedJobs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
