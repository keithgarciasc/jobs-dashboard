import { useState } from 'react';

function JobRow({ job, onApply, hideApplyButton = false }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleApplyClick = () => {
    if (!job.isApplied && onApply) {
      onApply(job.id, job);
    }
  };

  return (
    <div className={`job-row ${job.isApplied ? 'applied' : ''}`}>
      <div className="job-info">
        <div className="job-main">
          <h3 className="job-title">{job.job_title}</h3>
          <p className="job-company">
            {job.company !== 'NULL' ? job.company : 'Company not listed'}
          </p>
        </div>
        <div className="job-details">
          <span className="job-location">{job.location}</span>
          {job.pay && job.pay !== 'NULL' && (
            <span className="job-pay">
              ${typeof job.pay === 'number' ? job.pay.toLocaleString() : job.pay}
            </span>
          )}
          {job.appliedAt && (
            <span className="job-applied-date">
              Applied: {new Date(job.appliedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
        <div className="job-scores">
          {job.confidence_label && (
            <span className={`confidence-badge ${job.confidence_label.toLowerCase().replace(/\s+/g, '-')}`}>
              {job.confidence_label}
            </span>
          )}
          {job.hire_likelihood_score !== undefined && (
            <span className="score hire">Hire Likelihood: {job.hire_likelihood_score}/10</span>
          )}
          {job.skill_match_score !== undefined && (
            <span className="score skill">Skill Match: {job.skill_match_score}/10</span>
          )}
          {job.compensation_score !== undefined && (
            <span className="score compensation">Compensation: {job.compensation_score}/10</span>
          )}
        </div>
        {job.explanation && (
          <div className="job-reasoning">
            <button
              className="toggle-details-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Trail Notes
            </button>
            {showDetails && (
              <div className="reasoning-details">
                <div className="reasoning-item">
                  <p>{job.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="job-actions">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="job-post-link"
        >
          View Bounty
        </a>
        {!hideApplyButton && (
          <button
            className={`apply-btn ${job.isApplied ? 'applied' : ''}`}
            onClick={handleApplyClick}
            disabled={job.isApplied}
          >
            {job.isApplied ? 'Claimed!' : 'Claim It!'}
          </button>
        )}
      </div>
    </div>
  );
}

export default JobRow;
