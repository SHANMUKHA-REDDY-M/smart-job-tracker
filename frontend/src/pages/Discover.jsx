import { useEffect, useState } from 'react';
import customFetch from '../utils/customFetch.js';

const statuses = ['saved', 'applied', 'interview', 'offer', 'rejected'];

export default function Discover() {
  const [filters, setFilters] = useState({ q: '', location: '' });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [source, setSource] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [hasResume, setHasResume] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadApplications() {
    const { data } = await customFetch.get('/applications');
    setApplications(data);
  }

  async function searchJobs(event) {
    event?.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await customFetch.get('/discovery/jobs', { params: filters });
      setJobs(data.jobs);
      setSource(data.source);
      setHasResume(data.hasResume);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to discover jobs.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    searchJobs();
    loadApplications().catch(() => setError('Unable to load your applications.'));
    customFetch.get('/resume')
      .then(({ data }) => setResumeText(data.resumeText))
      .catch(() => setError('Unable to load your resume.'));
  }, []);

  async function saveResume(event) {
    event.preventDefault();
    setIsSavingResume(true);
    setError('');
    try {
      await customFetch.put('/resume', { resumeText });
      setHasResume(Boolean(resumeText.trim()));
      await searchJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save resume.');
    } finally {
      setIsSavingResume(false);
    }
  }

  async function saveJob(job) {
    setError('');
    try {
      await customFetch.post('/applications', {
        externalJobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobUrl: job.jobUrl
      });
      await loadApplications();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This job may already be saved.');
    }
  }

  async function updateStatus(application, status) {
    await customFetch.patch(`/applications/${application._id}`, { status });
    await loadApplications();
  }

  function isSaved(job) {
    return applications.some((application) => application.externalJobId === job.id);
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Discover jobs</h1>
          <p>Find opportunities and move the ones you want into your application tracker.</p>
        </div>
      </div>
      <form className="discovery-filters" onSubmit={searchJobs}>
        <input
          aria-label="Search jobs"
          placeholder="Search role or skill"
          value={filters.q}
          onChange={(event) => setFilters({ ...filters, q: event.target.value })}
        />
        <input
          aria-label="Filter by location"
          placeholder="Location"
          value={filters.location}
          onChange={(event) => setFilters({ ...filters, location: event.target.value })}
        />
        <button type="submit">Search jobs</button>
      </form>
      {source && <p className="source-note">Results from {source}.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="resume-panel" onSubmit={saveResume}>
        <div>
          <h2>Personalize your matches</h2>
          <p>Paste your resume text to calculate transparent keyword-based match scores.</p>
        </div>
        <textarea
          aria-label="Resume text"
          rows="5"
          maxLength="30000"
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
        />
        <button type="submit" disabled={isSavingResume}>
          {isSavingResume ? 'Saving...' : hasResume ? 'Update resume' : 'Save resume'}
        </button>
      </form>
      <div className="discovery-grid">
        <div className="discovery-results">
          {isLoading ? <p>Searching jobs...</p> : jobs.length === 0 ? (
            <p>No matching jobs found.</p>
          ) : jobs.map((job) => (
            <article className="discovery-card" key={job.id}>
              <div>
                <h3>{job.title}</h3>
                <p>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                {job.match && (
                  <span className="match-score">{job.match.score}% match</span>
                )}
                <p className="job-description">{job.description}</p>
              </div>
              <div className="job-actions">
                <a className="job-link" href={job.jobUrl} target="_blank" rel="noreferrer">View posting</a>
                <button type="button" disabled={isSaved(job)} onClick={() => saveJob(job)}>
                  {isSaved(job) ? 'Saved' : 'Save application'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="application-panel">
          <h2>My applications</h2>
          {applications.length === 0 ? <p>No discovered jobs saved yet.</p> : applications.map((application) => (
            <div className="application-item" key={application._id}>
              <strong>{application.title}</strong>
              <span>{application.company}</span>
              <select value={application.status} onChange={(event) => updateStatus(application, event.target.value)}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              {application.timeline.length > 1 && (
                <small>{application.timeline.length} status updates tracked</small>
              )}
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
