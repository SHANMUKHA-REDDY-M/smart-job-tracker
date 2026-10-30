export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <div>
        <h3>{job.position}</h3>
        <p>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
      </div>
      <span className={`status status-${job.status}`}>{job.status}</span>
    </article>
  );
}

