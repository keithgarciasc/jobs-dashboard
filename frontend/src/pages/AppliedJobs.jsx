import { useState, useEffect } from 'react';
import JobSection from '../components/JobSection';

function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  async function fetchAppliedJobs() {
    try {
      setLoading(true);
      const response = await fetch('/api/applied');
      if (!response.ok) {
        throw new Error('Failed to fetch applied jobs');
      }
      const data = await response.json();

      // Transform the data to match the expected format
      // Sort by applied_at (most recent first)
      const transformedJobs = data
        .map(item => ({
          ...item.jobData,
          id: item.jobId,
          isApplied: true,
          appliedAt: item.appliedAt
        }))
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

      setAppliedJobs(transformedJobs);
      setError(null);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Tracking your trail of success...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchAppliedJobs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Your Bounty Trail</h1>
        <p className="subtitle">Badges of courage - jobs you've conquered!</p>
        <div className="motivational-quote">
          You're making moves, partner! Each application is a notch in your belt of success!
        </div>
      </header>
      <div className="dashboard">
        <JobSection
          title="Your Applied Bounties"
          jobs={appliedJobs}
          hideApplyButton={true}
        />
      </div>
    </div>
  );
}

export default AppliedJobs;
