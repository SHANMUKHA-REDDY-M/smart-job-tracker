import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customFetch from '../utils/customFetch.js';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [formValues, setFormValues] = useState({
    company: '',
    position: '',
    status: 'applied'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get('/jobs');
      setJobs(data.jobs || data);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function handleChange(event) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await customFetch.post('/jobs', formValues);
      setFormValues({ company: '', position: '', status: 'applied' });
      await fetchJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || 'Unable to create job.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteJob(jobId) {
    setError('');

    try {
      await customFetch.delete(`/jobs/${jobId}`);
      await fetchJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || 'Unable to delete job.');
    }
  }

  async function handleUpdateStatus(jobId, currentStatus) {
    const statuses = ['pending', 'applied', 'interview', 'offer', 'rejected'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setError('');

    try {
      await customFetch.patch(`/jobs/${jobId}`, { status: nextStatus });
      await fetchJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || 'Unable to update job status.');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Welcome, {JSON.parse(localStorage.getItem('user') || 'null')?.name || 'there'}</h1>
          <p>Keep every opportunity organized in one place.</p>
        </div>
        <button type="button" onClick={logout}>Log out</button>
      </div>
      <form className="job-form" onSubmit={handleSubmit}>
        <input
          name="company"
          placeholder="Company"
          value={formValues.company}
          onChange={handleChange}
          required
        />
        <input
          name="position"
          placeholder="Position"
          value={formValues.position}
          onChange={handleChange}
          required
        />
        <select name="status" value={formValues.status} onChange={handleChange}>
          {['pending', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add job'}
        </button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="job-list">
        {isLoading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs found. Start applying!</p>
        ) : (
          jobs.map((job) => (
            <article className="job-card" key={job._id}>
              <div>
                <h3>{job.position}</h3>
                <p>{job.company}</p>
                <small>Created {new Date(job.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="job-actions">
                <button
                  className={`status status-${job.status}`}
                  type="button"
                  onClick={() => handleUpdateStatus(job._id, job.status)}
                  title="Click to cycle status"
                >
                  {job.status} ↻
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => handleDeleteJob(job._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
