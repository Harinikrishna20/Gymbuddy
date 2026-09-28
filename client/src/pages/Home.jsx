import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ClassCard from '../components/ClassCard';
import { useAuth } from '../context/AuthContext';

const featureList = [
  {
    title: 'Easy Class Booking',
    text: 'Reserve your preferred class in just a few clicks and avoid last-minute hassle.',
  },
  {
    title: 'Experienced Trainers',
    text: 'Train with skilled professionals who guide every step of your fitness journey.',
  },
  {
    title: 'Flexible Schedules',
    text: 'Choose sessions that fit your routine, from early morning to evening workouts.',
  },
  {
    title: 'Track Your Bookings',
    text: 'Stay on top of your schedule and keep your training routine consistent.',
  },
];

export default function Home() {
  const { classes, classesLoading, classesError, refreshClasses } = useAuth();
  const featuredClasses = classes.slice(0, 6);
  const openClasses = classes.filter((item) => item.availableSeats > 0).length;
  const availableSeats = classes.reduce((total, item) => total + item.availableSeats, 0);
  const metricValue = (value) => (classesLoading ? '...' : classesError ? '—' : value);

  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Your fitness, your time</p>
            <h1>Book Your Workout. Stay Consistent.</h1>
            <p className="hero-description">
              Discover gym classes, choose your preferred time, and reserve your spot with ease.
            </p>
            <div className="hero-actions">
              <Button to="/classes">Explore Classes</Button>
              <Button to="/register" variant="secondary">Join Now</Button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-stat">
              <strong>{metricValue(classes.length)}</strong>
              <span>Scheduled Classes</span>
            </div>
            <div className="hero-stat">
              <strong>{metricValue(openClasses)}</strong>
              <span>Classes With Open Seats</span>
            </div>
            <div className="hero-stat">
              <strong>{metricValue(availableSeats)}</strong>
              <span>Available Seats</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <p className="eyebrow">Why members love us</p>
          <h2>Built for a smoother gym routine</h2>
        </div>

        <div className="feature-grid">
          {featureList.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Popular classes</p>
            <h2>Find your next session</h2>
          </div>
          <Link to="/classes" className="text-link">View all classes</Link>
        </div>

        {classesError && (
          <p className="error-text" role="alert">
            {classesError}{' '}
            <button type="button" className="text-link" onClick={refreshClasses}>Retry</button>
          </p>
        )}

        <div className="class-grid">
          {classesLoading ? (
            <div className="empty-state" role="status">Loading classes...</div>
          ) : featuredClasses.length > 0 ? (
            featuredClasses.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))
          ) : (
            <div className="empty-state">No gym classes are currently scheduled.</div>
          )}
        </div>
      </section>

      <section className="container cta-section">
        <div>
          <p className="eyebrow">Ready to move?</p>
          <h2>Ready for your next workout?</h2>
        </div>

        <Button to="/classes" variant="primary">Browse Classes</Button>
      </section>
    </div>
  );
}
