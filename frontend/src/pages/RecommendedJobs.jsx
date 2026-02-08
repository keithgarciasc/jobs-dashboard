import { useState, useEffect } from 'react';
import JobSection from '../components/JobSection';
import API_BASE_URL from '../config';

const JOBS_PER_PAGE = 10;

function RecommendedJobs() {
  const [recommendedJobs, setRecommendedJobs] = useState({
    local_charleston: [],
    remote_other: [],
    side_gigs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state for each section
  const [pages, setPages] = useState({
    local_charleston: 0,
    remote_other: 0,
    side_gigs: 0
  });

  useEffect(() => {
    document.title = 'Wanted Board - Job Wrangler';
    fetchRecommendedJobs();
  }, []);

  async function fetchRecommendedJobs() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recommended`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommended jobs');
      }
      const data = await response.json();
      setRecommendedJobs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recommended jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId, jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, jobData })
      });

      if (!response.ok) {
        throw new Error('Failed to apply');
      }

      // Remove the applied job from the list
      setRecommendedJobs(prevJobs => {
        const updatedJobs = { ...prevJobs };
        for (const section in updatedJobs) {
          updatedJobs[section] = updatedJobs[section].filter(job => job.id !== jobId);
        }
        return updatedJobs;
      });
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Failed to mark job as applied. Please try again.');
    }
  }

  function handleNext(section) {
    setPages(prev => ({
      ...prev,
      [section]: prev[section] + 1
    }));
  }

  function handlePrevious(section) {
    setPages(prev => ({
      ...prev,
      [section]: Math.max(0, prev[section] - 1)
    }));
  }

  function getPaginatedJobs(section) {
    const jobs = recommendedJobs[section];
    const startIndex = pages[section] * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    return jobs.slice(startIndex, endIndex);
  }

  function getTotalPages(section) {
    return Math.ceil(recommendedJobs[section].length / JOBS_PER_PAGE);
  }

  function hasNext(section) {
    return pages[section] < getTotalPages(section) - 1;
  }

  function hasPrevious(section) {
    return pages[section] > 0;
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Scouting the frontier for hidden gems...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchRecommendedJobs}>Retry</button>
      </div>
    );
  }

  const sections = [
    {
      key: 'local_charleston',
      title: 'Local Territory Bounties',
      jobs: getPaginatedJobs('local_charleston')
    },
    {
      key: 'remote_other',
      title: 'Frontier & Remote Trails',
      jobs: getPaginatedJobs('remote_other')
    },
    {
      key: 'side_gigs',
      title: 'Quick Draw Side Hustles',
      jobs: getPaginatedJobs('side_gigs')
    }
  ];

  const totalJobs = recommendedJobs.local_charleston.length +
                    recommendedJobs.remote_other.length +
                    recommendedJobs.side_gigs.length;

  return (
    <div className="page-container">
      <header className="page-header">
              <h1>Wanted Board</h1>
        <p className="subtitle">Past opportunities from the archives - still worth a shot!</p>
        <div className="motivational-quote">
          Don't let these gems slip away - sometimes the best bounties hide in plain sight!
        </div>
        <div className="stats">
          Total Recommended: {totalJobs}
        </div>
      </header>
      <div className="dashboard">
        {sections.map(section => (
          <div key={section.key} className="paginated-section">
            <JobSection
              title={section.title}
              jobs={section.jobs}
              onApply={handleApply}
            />
            {recommendedJobs[section.key].length > JOBS_PER_PAGE && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePrevious(section.key)}
                  disabled={!hasPrevious(section.key)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {pages[section.key] + 1} of {getTotalPages(section.key)}
                  {' '}({recommendedJobs[section.key].length} total)
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handleNext(section.key)}
                  disabled={!hasNext(section.key)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedJobs;
