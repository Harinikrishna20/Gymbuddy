import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { to: '/', label: 'Home' },
        { to: '/classes', label: 'Explore Activities' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    if (isAdmin) {
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/classes', label: 'Classes' },
        { to: '/admin/bookings', label: 'Bookings' },
        { to: '/profile', label: 'Profile' },
      ];
    }

    if (user.role === 'trainer') {
      return [
        { to: '/trainer', label: 'Dashboard' },
        { to: '/trainer/classes', label: 'My Classes' },
        { to: '/classes', label: 'Explore Activities' },
        { to: '/profile', label: 'Profile' },
      ];
    }

    return [
      { to: '/learner', label: 'Dashboard' },
      { to: '/classes', label: 'Explore Activities' },
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/profile', label: 'Profile' },
    ];
  };

  const links = getNavLinks();

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="brand" aria-label="FitSphere home">
          FitSphere
        </Link>

        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}

          {isLoggedIn && (
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <div className="nav-user">
          {user ? `${user.fullName}` : 'Guest'}
        </div>
      </nav>
    </header>
  );
}
