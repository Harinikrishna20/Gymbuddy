import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const { user, bookings, classes, dataLoading, dataError, cancelBooking } = useAuth();
  const [actionError, setActionError] = useState('');

  const userBookings = useMemo(
    () => bookings.filter((booking) => booking.memberId === user?.id),
    [bookings, user],
  );

  const upcoming = userBookings.filter((booking) => booking.status === 'upcoming');
  const history = userBookings.filter((booking) => booking.status !== 'upcoming');

  const getClassById = (classId) => classes.find((item) => item.id === classId);

  const handleCancel = async (bookingId) => {
    const result = await cancelBooking(bookingId);
    setActionError(result.success ? '' : result.message);
  };

  if (!user) {
    return <div className="container page-shell empty-state">Please log in to view bookings.</div>;
  }

  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">Your schedule</p>
        <h1>My Bookings</h1>
      </div>

      {dataError && <p className="error-text" role="alert">{dataError}</p>}
      {actionError && <p className="error-text" role="alert">{actionError}</p>}

      {dataLoading ? (
        <div className="empty-state" role="status">Loading your bookings...</div>
      ) : userBookings.length === 0 ? (
        <div className="empty-state">
          <p>You don&apos;t have any bookings yet.</p>
          <Link to="/classes" className="btn btn-primary">Browse Classes</Link>
        </div>
      ) : (
        <>
          <section className="booking-list-section">
            <h2>Upcoming Classes</h2>
            {upcoming.length === 0 ? (
              <p className="empty-text">No upcoming classes.</p>
            ) : (
              upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  classItem={booking.gymClass || getClassById(booking.classId)}
                  onCancel={handleCancel}
                />
              ))
            )}
          </section>

          <section className="booking-list-section">
            <h2>Booking History</h2>
            {history.length === 0 ? (
              <p className="empty-text">No past bookings.</p>
            ) : (
              history.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  classItem={booking.gymClass || getClassById(booking.classId)}
                  showHistory
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
