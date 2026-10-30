import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatAssistant from '../components/ChatAssistant.jsx';
import customFetch from '../utils/customFetch.js';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [formValues, setFormValues] = useState({
    company: '',
    position: '',
    location: '',
    jobUrl: '',
    notes: '',
    appliedAt: new Date().toISOString().slice(0, 10),
    status: 'applied'
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingJobId, setEditingJobId] = useState(null);
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
      if (editingJobId) {
        await customFetch.patch(`/jobs/${editingJobId}`, formValues);
      } else {
        await customFetch.post('/jobs', formValues);
      }
      resetForm();
      await fetchJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || 'Unable to create job.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFormValues({
      company: '',
      position: '',
      location: '',
      jobUrl: '',
      notes: '',
      appliedAt: new Date().toISOString().slice(0, 10),
      status: 'applied'
    });
    setEditingJobId(null);
  }

  function startEditing(job) {
    setEditingJobId(job._id);
    setFormValues({
      company: job.company || '',
      position: job.position || '',
      location: job.location || '',
      jobUrl: job.jobUrl || '',
      notes: job.notes || '',
      appliedAt: job.appliedAt ? new Date(job.appliedAt).toISOString().slice(0, 10) : '',
      status: job.status || 'pending'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [job.company, job.position, job.location, job.notes]
        .some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (statusFilter === 'all' || job.status === statusFilter);
  });

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Welcome, {JSON.parse(localStorage.getItem('user') || 'null')?.name || 'there'}</h1>
          <p>Keep every opportunity organized in one place.</p>
        </div>
        <button type="button" onClick={logout}>Log out</button>
      </div>
      <div className="tracker-toolbar">
        <input
          aria-label="Search jobs"
          placeholder="Search company, role, or location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {['pending', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
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
        <input
          name="location"
          placeholder="Location"
          value={formValues.location}
          onChange={handleChange}
        />
        <input
          name="jobUrl"
          type="url"
          placeholder="Job link"
          value={formValues.jobUrl}
          onChange={handleChange}
        />
        <input
          name="appliedAt"
          type="date"
          value={formValues.appliedAt}
          onChange={handleChange}
        />
        <select name="status" value={formValues.status} onChange={handleChange}>
          {['pending', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          name="notes"
          placeholder="Notes (optional)"
          value={formValues.notes}
          onChange={handleChange}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingJobId ? 'Save changes' : 'Add job'}
        </button>
        {editingJobId && (
          <button className="secondary-button" type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="job-list">
        {isLoading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs found. Start applying!</p>
        ) : (
          filteredJobs.map((job) => (
            <article className="job-card" key={job._id}>
              <div>
                <h3>{job.position}</h3>
                <p>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                <small>Applied {new Date(job.appliedAt || job.createdAt).toLocaleDateString()}</small>
                {job.notes && <p className="job-notes">{job.notes}</p>}
              </div>
              <div className="job-actions">
                {job.jobUrl && (
                  <a className="job-link" href={job.jobUrl} target="_blank" rel="noreferrer">
                    Job link
                  </a>
                )}
                <button type="button" className="edit-button" onClick={() => startEditing(job)}>
                  Edit
                </button>
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
        {!isLoading && filteredJobs.length === 0 && jobs.length > 0 && (
          <p>No jobs match your current filters.</p>
        )}
      </div>
      <ChatAssistant />
    </section>
  );
}
