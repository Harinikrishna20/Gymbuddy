import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ClassCard from '../components/ClassCard';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';

const activityCategories = [
  { name: 'Fitness', icon: '🏋️' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Dance', icon: '💃' },
  { name: 'Badminton', icon: '🏸' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Football', icon: '⚽' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Zumba', icon: '🎵' },
  { name: 'Meditation', icon: '🧘‍♀️' },
  { name: 'Other', icon: '✦' },
];

export default function Home() {
  const { classes, classesLoading, classesError, refreshClasses, user } = useAuth();
  const featuredClasses = classes.slice(0, 6);
  const openClasses = classes.filter((item) => item.availableSeats > 0).length;
  const availableSeats = classes.reduce((total, item) => total + item.availableSeats, 0);
  const metricValue = (value) => (classesLoading ? '...' : classesError ? '—' : value);

  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="container hero-grid">
          <img className="hero-image" src={heroImage} alt="" />
          <div className="hero-copy">
            <p className="eyebrow">Move with FitSphere</p>
            <h1>Discover. Learn.<br />Play. Stay Fit.</h1>
            <p className="hero-description">
              Find and book sports, fitness, and activity classes near you.
            </p>
            <div className="hero-actions">
              <Button to="/classes">Explore Activities</Button>
              {user?.role === 'trainer' ? (
                <Button to="/trainer/classes" variant="secondary">Create a Class</Button>
              ) : user?.role !== 'admin' ? (
                <Button to="/register?role=trainer" variant="secondary">Become a Trainer</Button>
              ) : null}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-stat">
              <strong>{metricValue(classes.length)}</strong>
              <span>Live Classes</span>
            </div>
            <div className="hero-stat">
              <strong>{metricValue(openClasses)}</strong>
              <span>Open Activities</span>
            </div>
            <div className="hero-stat">
              <strong>{metricValue(availableSeats)}</strong>
              <span>Seats Available</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block activity-section">
        <div className="section-heading">
          <p className="eyebrow">Choose your kind of movement</p>
          <h2>Explore activities</h2>
        </div>

        <div className="activity-grid">
          {activityCategories.map((activity) => (
            <Link key={activity.name} to={`/classes?category=${encodeURIComponent(activity.name)}`} className="activity-tile">
              <span className="activity-icon" aria-hidden="true">{activity.icon}</span>
              <span>{activity.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Classes from real trainers</p>
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
            <div className="empty-state">No activities are scheduled yet.</div>
          )}
        </div>
      </section>

      <section className="container cta-section">
        <div>
          <p className="eyebrow">Have a skill to share?</p>
          <h2>Become a FitSphere trainer</h2>
        </div>

        <Button to="/register?role=trainer" variant="primary">Become a Trainer</Button>
      </section>
    </div>
  );
}
