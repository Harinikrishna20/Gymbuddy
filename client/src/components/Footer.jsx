import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>FitSphere</h3>
          <p>Discover. Learn. Play. Stay Fit.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/classes">Explore Activities</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FitSphere</p>
      </div>
    </footer>
  );
}
