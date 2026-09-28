import { formatDateLabel } from '../utils/date';

export default function BookingCard({ booking, classItem, onCancel, showHistory = false }) {
  classItem = booking.gymClass || classItem;
  if (!classItem) return null;

  return (
    <div className="booking-card">
      <div>
        <h3>{classItem.title}</h3>
        <p>{formatDateLabel(classItem.date)}</p>
        <p>{classItem.startTime} - {classItem.endTime}</p>
        <p>Trainer: {classItem.trainer}</p>
        <p>Location: {classItem.location}</p>
        {showHistory && <span className="status-tag status-history">{booking.bookingStatus || booking.status}</span>}
      </div>

      {!showHistory && (
        <button type="button" className="btn btn-secondary" onClick={() => onCancel(booking.id)}>
          Cancel Booking
        </button>
      )}
    </div>
  );
}
