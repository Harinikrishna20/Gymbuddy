import { useAuth } from '../../context/AuthContext';

export default function ManageBookings() {
  const { adminBookings, dataLoading, dataError } = useAuth();
  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">Reservations</p>
        <h1>Manage Bookings</h1>
      </div>

      {dataError && <p className="error-text" role="alert">{dataError}</p>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Trainer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.memberName}</td>
                  <td>{booking.email}</td>
                  <td>{booking.className}</td>
                  <td>{booking.trainer}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td><span className="status-tag">{booking.status}</span></td>
                </tr>
            ))}
            {!dataLoading && adminBookings.length === 0 && (
              <tr><td colSpan="7">No bookings have been made.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
