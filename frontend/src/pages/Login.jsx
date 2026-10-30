import { Link, useNavigate } from 'react-router-dom';
import FormRow from '../components/FormRow.jsx';

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/dashboard');
  }

  return (
    <section className="auth-card">
      <h1>Welcome back</h1>
      <form onSubmit={handleSubmit}>
        <FormRow label="Email" type="email" required />
        <FormRow label="Password" type="password" required />
        <button type="submit">Log in</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </section>
  );
}

