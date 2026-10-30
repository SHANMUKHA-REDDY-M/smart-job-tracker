import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customFetch from '../utils/customFetch.js';
import FormRow from '../components/FormRow.jsx';

export default function Register() {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker'
  });
  const [isMember, setIsMember] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  function handleChange(event) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [event.target.name]: event.target.value
    }));
  }

  function toggleMember() {
    setIsMember((currentValue) => !currentValue);
    setError('');
  }

  function selectRole(role) {
    setFormValues((currentValues) => ({ ...currentValues, role }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = isMember ? '/auth/login' : '/auth/register';
      const payload = isMember
        ? { email: formValues.email, password: formValues.password }
        : formValues;
      const { data } = await customFetch.post(endpoint, payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (requestError) {
      setError(
        requestError.response?.data?.msg ||
          requestError.response?.data?.message ||
          'Unable to authenticate. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={`auth-card auth-${formValues.role}`}>
      <div className="auth-intro">
        <span className="auth-eyebrow">SMART JOB TRACKER</span>
        <h1>{isMember
          ? formValues.role === 'company' ? 'Welcome back, hiring team' : 'Welcome back'
          : formValues.role === 'company' ? 'Build your hiring pipeline' : 'Plan your next move'}
        </h1>
        <p>
          {formValues.role === 'company'
            ? 'Find great candidates and keep every hiring step organized.'
            : 'Keep your applications organized and move confidently through your job search.'}
        </p>
      </div>
      <div className="role-switcher" aria-label="Account type">
        <button
          className={formValues.role === 'seeker' ? 'role-option active' : 'role-option'}
          type="button"
          onClick={() => selectRole('seeker')}
        >
          <strong>Job seeker</strong>
          <span>Track applications</span>
        </button>
        <button
          className={formValues.role === 'company' ? 'role-option active' : 'role-option'}
          type="button"
          onClick={() => selectRole('company')}
        >
          <strong>Company</strong>
          <span>Manage hiring</span>
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {!isMember && (
          <FormRow
            label={formValues.role === 'company' ? 'Company name' : 'Full name'}
            name="name"
            value={formValues.name}
            onChange={handleChange}
            required
          />
        )}
        <FormRow
          label="Email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          required
        />
        <FormRow
          label="Password"
          name="password"
          type="password"
          minLength="6"
          value={formValues.password}
          onChange={handleChange}
          required
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isMember ? 'Log in' : 'Register'}
        </button>
      </form>
      <button
        className="link-button"
        type="button"
        onClick={toggleMember}
      >
        {isMember ? 'Need an account? Register' : 'Already registered? Log in'}
      </button>
    </section>
  );
}
