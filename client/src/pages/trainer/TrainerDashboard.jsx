import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TrainerDashboard() {
  const { user, myClasses, trainerStats, dataLoading, dataError } = useAuth();
  const upcomingClasses = myClasses.filter((classItem) => classItem.date >= new Date().toISOString().slice(0, 10));
  const stats = [
    { label: 'My Classes', value: trainerStats?.totalClasses },
    { label: 'Total Learners', value: trainerStats?.totalLearners },
    { label: 'Upcoming Classes', value: trainerStats?.upcomingClasses },
    { label: 'Total Bookings', value: trainerStats?.totalBookings },
  ];

  return (
    <div className="container page-shell dashboard-page">
      <div className="section-heading split">
        <div>
          <p className="eyebrow">Trainer dashboard</p>
          <h1>Welcome, {user?.fullName}</h1>
        </div>
        <Link to="/trainer/classes" className="btn btn-primary">Manage Classes</Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{dataLoading ? '...' : stat.value ?? 0}</strong>
          </div>
        ))}
      </div>

      {dataError && <p className="error-text" role="alert">{dataError}</p>}

      <section className="dashboard-section">
        <div className="section-heading split">
          <div><p className="eyebrow">Your program</p><h2>My Classes</h2></div>
          <Link to="/trainer/classes" className="text-link">Create or manage classes</Link>
        </div>

        {dataLoading ? (
          <div className="empty-state" role="status">Loading your classes...</div>
        ) : myClasses.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Class</th><th>Date</th><th>Time</th><th>Capacity</th><th>Booked</th><th>Seats</th><th>Roster</th></tr></thead>
              <tbody>
                {upcomingClasses.map((classItem) => (
                  <tr key={classItem.id}>
                    <td>{classItem.title}</td>
                    <td>{classItem.date}</td>
                    <td>{classItem.startTime} - {classItem.endTime}</td>
                    <td>{classItem.capacity}</td>
                    <td>{classItem.bookedSeats}</td>
                    <td>{classItem.availableSeats}</td>
                    <td><Link to={`/trainer/classes/${classItem.id}/learners`} className="text-link">View learners</Link></td>
                  </tr>
                ))}
                {upcomingClasses.length === 0 && <tr><td colSpan="7">No upcoming classes.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">You haven&apos;t created any classes yet.</div>
        )}
      </section>
    </div>
  );
}
