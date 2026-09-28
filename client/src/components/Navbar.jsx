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
        { to: '/classes', label: 'Classes' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    if (isAdmin) {
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/classes', label: 'Classes' },
        { to: '/admin/bookings', label: 'Bookings' },
        { to: '/profile', label: 'Profile' },
      ];
    }

    return [
      { to: '/', label: 'Home' },
      { to: '/classes', label: 'Classes' },
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/profile', label: 'Profile' },
    ];
  };

  const links = getNavLinks();

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="brand" aria-label="Gym Booker home">
          GYM BOOKER
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
