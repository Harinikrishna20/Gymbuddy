import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ClassLearners() {
  const { classId } = useParams();
  const { myClasses } = useAuth();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const classItem = myClasses.find((item) => item.id === classId);

  useEffect(() => {
    let isActive = true;

    const loadLearners = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/classes/${classId}/learners`);
        if (isActive) setLearners(response.data.data);
      } catch (requestError) {
        if (isActive) setError(requestError.response?.data?.message || 'Unable to load learners.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadLearners();
    return () => { isActive = false; };
  }, [classId]);

  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">Class roster</p>
        <h1>{classItem?.title || 'Learners'}</h1>
        {classItem && <p>{classItem.date} · {classItem.startTime} - {classItem.endTime}</p>}
      </div>

      <p><Link to="/trainer/classes" className="text-link">Back to my classes</Link></p>
      {error && <p className="error-text" role="alert">{error}</p>}
      {loading ? (
        <div className="empty-state" role="status">Loading learners...</div>
      ) : learners.length ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Booked At</th></tr></thead>
            <tbody>
              {learners.map((learner) => (
                <tr key={learner.bookingId}>
                  <td>{learner.name}</td>
                  <td>{learner.email}</td>
                  <td>{learner.bookedAt ? new Date(learner.bookedAt).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error ? (
        <div className="empty-state">No learners have booked this class.</div>
      ) : null}
    </div>
  );
}
