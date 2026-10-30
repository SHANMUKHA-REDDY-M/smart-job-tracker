import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Smart Job Tracker</Link>
      {isLoggedIn ? (
        <div className="nav-actions">
          <Link to="/discover">Discover jobs</Link>
          <button onClick={logout}>Log out</button>
        </div>
      ) : (
        <Link to="/register">Log in</Link>
      )}
    </nav>
  );
}
