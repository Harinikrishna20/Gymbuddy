import { useEffect, useState } from 'react';
import api from '../../api/axios';

const roleOptions = ['learner', 'trainer', 'admin'];

export default function ManageUsers() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const query = roleFilter === 'all' ? '' : `?role=${roleFilter}`;
        const response = await api.get(`/admin/users${query}`);
        if (isActive) setUsers(response.data.data);
      } catch (requestError) {
        if (isActive) setError(requestError.response?.data?.message || 'Unable to load users.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadUsers();
    return () => { isActive = false; };
  }, [roleFilter, refreshKey]);

  const handleRoleChange = async (userId, role) => {
    setError('');
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((currentUsers) => currentUsers.map((user) => (
        user._id === userId ? { ...user, role: response.data.data.role } : user
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this user.');
      setRefreshKey((current) => current + 1);
    }
  };

  return (
    <div className="container page-shell">
      <div className="section-heading split">
        <div><p className="eyebrow">Platform administration</p><h1>Manage Users</h1></div>
        <select aria-label="Filter users by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">All roles</option>
          <option value="learner">Learners</option>
          <option value="trainer">Trainers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && <p className="error-text" role="alert">{error}</p>}
      {loading ? (
        <div className="empty-state" role="status">Loading users...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select aria-label={`Role for ${user.name}`} value={user.role} onChange={(event) => handleRoleChange(user._id, event.target.value)}>
                      {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
