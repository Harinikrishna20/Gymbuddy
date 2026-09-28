import { Link } from 'react-router-dom';
import { formatDateLabel } from '../utils/date';

export default function ClassCard({ classItem, showBookButton = false, onBook }) {
  const availableSeats = classItem.availableSeats ?? classItem.capacity - classItem.bookedSeats;
  const isFull = availableSeats <= 0;

  return (
    <article className="class-card">
      <div className="card-badge">{classItem.category}</div>
      <h3>{classItem.title}</h3>
      <p className="card-trainer">Trainer: {classItem.trainer}</p>
      <p className="card-meta">Date: {formatDateLabel(classItem.date)}</p>
      <p className="card-meta">Time: {classItem.startTime} - {classItem.endTime}</p>
      <p className="card-meta">Location: {classItem.location}</p>

      <div className="class-card-footer">
        <span className={isFull ? 'seats full' : 'seats'}>
          {isFull ? `${classItem.capacity} / ${classItem.capacity} seats` : `${availableSeats} / ${classItem.capacity} seats available`}
        </span>

        <div className="card-actions">
          <Link to={`/classes/${classItem.id}`} className="btn btn-secondary">
            View Details
          </Link>

          {showBookButton && !isFull && onBook && (
            <button type="button" className="btn btn-primary" onClick={() => onBook(classItem)}>
              Book
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
