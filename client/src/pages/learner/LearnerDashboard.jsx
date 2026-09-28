import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingCard from '../../components/BookingCard';

export default function LearnerDashboard() {
  const { user, bookings, classes, dataLoading, dataError, cancelBooking } = useAuth();
  const [actionError, setActionError] = useState('');
  const upcomingBookings = bookings.filter((booking) => booking.status === 'upcoming');
  const getClass = (booking) => booking.gymClass || classes.find((item) => item.id === booking.classId);

  const handleCancel = async (bookingId) => {
    const result = await cancelBooking(bookingId);
    setActionError(result.success ? '' : result.message);
  };

  return (
    <div className="container page-shell dashboard-page">
      <div className="section-heading split">
        <div>
          <p className="eyebrow">Learner dashboard</p>
          <h1>Welcome, {user?.fullName}</h1>
        </div>
        <Link to="/classes" className="btn btn-primary">Explore Activities</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>My Bookings</span><strong>{dataLoading ? '...' : bookings.length}</strong></div>
        <div className="stat-card"><span>Upcoming Classes</span><strong>{dataLoading ? '...' : upcomingBookings.length}</strong></div>
      </div>

      {dataError && <p className="error-text" role="alert">{dataError}</p>}
      {actionError && <p className="error-text" role="alert">{actionError}</p>}

      <section className="dashboard-section">
        <div className="section-heading split">
          <div><p className="eyebrow">Your schedule</p><h2>Upcoming classes</h2></div>
          <Link to="/my-bookings" className="text-link">View all bookings</Link>
        </div>
        {dataLoading ? (
          <div className="empty-state" role="status">Loading your bookings...</div>
        ) : upcomingBookings.length ? (
          <div className="booking-list-section">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking.id} booking={booking} classItem={getClass(booking)} onCancel={handleCancel} />
            ))}
          </div>
        ) : (
          <div className="empty-state">You have no upcoming bookings. Explore activities to find your next class.</div>
        )}
      </section>
    </div>
  );
}
