import JobSection from './JobSection';

function Dashboard({ jobs, onApply }) {
  const sections = [
    {
      key: 'local_charleston',
      title: 'Local Territory Bounties',
      jobs: jobs.local_charleston
    },
    {
      key: 'remote_other',
      title: 'Frontier & Remote Trails',
      jobs: jobs.remote_other
    },
    {
      key: 'side_gigs',
      title: 'Quick Draw Side Hustles',
      jobs: jobs.side_gigs
    }
  ];

  return (
    <div className="dashboard">
      {sections.map(section => (
        <JobSection
          key={section.key}
          title={section.title}
          jobs={section.jobs}
          onApply={onApply}
        />
      ))}
    </div>
  );
}

export default Dashboard;
