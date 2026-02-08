import JobRow from './JobRow';

function JobSection({ title, jobs, onApply, hideApplyButton = false }) {
  return (
    <section className="job-section">
      <h2 className="section-title">
        {title}
        <span className="job-count">({jobs.length})</span>
      </h2>
      <div className="jobs-list">
        {jobs.length === 0 ? (
          <p className="no-jobs">Tumbleweed territory - no bounties here yet, partner!</p>
        ) : (
          jobs.map(job => (
            <JobRow key={job.id} job={job} onApply={onApply} hideApplyButton={hideApplyButton} />
          ))
        )}
      </div>
    </section>
  );
}

export default JobSection;
