import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { authenticatedFetch } from '../config';

function Home() {
  const [jobs, setJobs] = useState({
    local_charleston: [],
    remote_other: [],
    side_gigs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId, jobData) {
    try {
      const response = await authenticatedFetch('/api/apply', {
        method: 'POST',
        body: JSON.stringify({ jobId, jobData })
      });

      if (!response.ok) {
        throw new Error('Failed to apply');
      }

      // Update local state immediately (optimistic update)
      setJobs(prevJobs => {
        const updatedJobs = { ...prevJobs };
        for (const section in updatedJobs) {
          updatedJobs[section] = updatedJobs[section].map(job =>
            job.id === jobId ? { ...job, isApplied: true } : job
          );
        }
        return updatedJobs;
      });
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Failed to mark job as applied. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Rounding up the opportunities, partner...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchJobs}>Retry</button>
      </div>
    );
  }

  const motivationalQuotes = [
    "Every application is a step closer to your dream destination!",
    "Saddle up, partner! Your perfect opportunity is out there!",
    "Keep riding - the right job is just over the next hill!",
    "You're not unemployed, you're between adventures!",
    "Winners never quit, and quitters never win the gold rush!",
    "The frontier of your career awaits - claim your stake!",
    "Be bold, be brave, be unstoppable in your job hunt!",
    "Your next great chapter is waiting to be written, cowpoke!"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Wrangle Your Dream Job!</h1>
        <p className="subtitle">Time to lasso those opportunities, partner!</p>
        <div className="motivational-quote">
          {randomQuote}
        </div>
      </header>
      <Dashboard jobs={jobs} onApply={handleApply} />
    </div>
  );
}

export default Home;
