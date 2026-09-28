import { useAuth } from '../../context/AuthContext';
import { formatDateLabel } from '../../utils/date';

export default function AdminDashboard() {
  const { classes, adminBookings, dashboardStats, dataLoading, dataError, classesLoading } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const todaysClasses = classes.filter((classItem) => classItem.date === today);

  const summaryCards = [
    { label: 'Total Members', value: dashboardStats?.totalMembers },
    { label: 'Total Classes', value: dashboardStats?.totalClasses },
    { label: 'Total Bookings', value: dashboardStats?.totalBookings },
    { label: 'Upcoming Classes', value: dashboardStats?.upcomingClasses },
  ];
  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">Admin overview</p>
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <span>{card.label}</span>
            <strong>{dataLoading ? '...' : card.value ?? '—'}</strong>
          </div>
        ))}
      </div>

      {dataError && <p className="error-text" role="alert">{dataError}</p>}

      <div className="admin-panels">
        <section className="panel-block">
          <h2>Today&apos;s Classes</h2>
          <ul className="list-stack">
            {classesLoading ? <li>Loading classes...</li> : todaysClasses.length > 0 ? todaysClasses.map((classItem) => (
              <li key={classItem.id}>
                <strong>{classItem.title}</strong>
                <span>{classItem.startTime}</span>
                <span>{classItem.bookedSeats} / {classItem.capacity} booked</span>
              </li>
            )) : <li>No classes scheduled for today.</li>}
          </ul>
        </section>

        <section className="panel-block">
          <h2>Recent Bookings</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Class</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminBookings.slice(0, 4).map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.memberName}</td>
                    <td>{booking.className}</td>
                    <td>{formatDateLabel(booking.date)}</td>
                    <td><span className="status-tag">{booking.status}</span></td>
                  </tr>
              ))}
              {!dataLoading && adminBookings.length === 0 && (
                <tr><td colSpan="4">No bookings have been made.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
