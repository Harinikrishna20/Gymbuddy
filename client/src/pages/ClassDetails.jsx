import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { formatDateLabel } from '../utils/date';

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, bookings, classes, classesLoading, classesError, refreshClasses, addBooking } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const classItem = useMemo(
    () => classes.find((item) => item.id === id),
    [classes, id],
  );

  const booked = bookings.some(
    (booking) => booking.memberId === user?.id && booking.classId === id && booking.status === 'upcoming',
  );

  if (classesLoading) {
    return <div className="container page-shell" role="status">Loading class...</div>;
  }

  if (classesError) {
    return (
      <div className="container page-shell">
        <p className="error-text" role="alert">{classesError}</p>
        <button type="button" className="btn btn-secondary" onClick={refreshClasses}>Retry</button>
      </div>
    );
  }

  if (!classItem) {
    return <div className="container page-shell">Class not found.</div>;
  }

  const availableSeats = classItem.availableSeats ?? classItem.capacity - classItem.bookedSeats;
  const isFull = availableSeats <= 0;
  const canBook = user?.role === 'learner';

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isFull || booked) {
      return;
    }

    setIsConfirming(true);
  };

  const handleConfirmBooking = async () => {
    const result = await addBooking(id);

    setIsConfirming(false);
    if (result.success) {
      setBookingSuccess(true);
      setBookingError('');
    } else {
      setBookingError(result.message);
    }
  };

  return (
    <div className="container page-shell details-page">
      <div className="details-header">
        <div>
          <p className="eyebrow">Class details</p>
          <h1>{classItem.title}</h1>
        </div>
      </div>

      <div className="details-card">
        <div className="details-info">
          <p>{classItem.description}</p>
          <ul>
            <li><strong>Trainer:</strong> {classItem.trainer}</li>
            <li><strong>Category:</strong> {classItem.category}</li>
            <li><strong>Date:</strong> {formatDateLabel(classItem.date)}</li>
            <li><strong>Start Time:</strong> {classItem.startTime}</li>
            <li><strong>End Time:</strong> {classItem.endTime}</li>
            <li><strong>Location:</strong> {classItem.location}</li>
            <li><strong>Capacity:</strong> {classItem.capacity}</li>
            <li><strong>Available Seats:</strong> {availableSeats} / {classItem.capacity}</li>
          </ul>
        </div>

        <div className="details-action-box">
          {!user ? (
            <Button to="/login">Login to Book</Button>
          ) : !canBook ? (
            <p className="empty-text">Bookings are available to learner accounts.</p>
          ) : booked ? (
            <button type="button" className="btn btn-secondary disabled" disabled>
              Already Booked
            </button>
          ) : isFull ? (
            <button type="button" className="btn btn-secondary disabled" disabled>
              Class Full
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleBook}>
              Book This Class
            </button>
          )}
        </div>
      </div>

      {isConfirming && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Confirm Booking</h2>
            <p className="modal-class-name">{classItem.title}</p>
            <p>{formatDateLabel(classItem.date)}</p>
            <p>{classItem.startTime} - {classItem.endTime}</p>
            <p>Trainer: {classItem.trainer}</p>
            <p>Location: {classItem.location}</p>
            <p>Are you sure you want to book this class?</p>

            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={handleConfirmBooking}>Confirm Booking</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsConfirming(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {bookingSuccess && (
        <div className="success-banner">
          <h3>Booking Successful!</h3>
          <p>Your spot has been reserved.</p>
        </div>
      )}

      {bookingError && <p className="error-text" role="alert">{bookingError}</p>}
    </div>
  );
}
