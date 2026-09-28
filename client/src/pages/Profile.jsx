import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">FitSphere account</p>
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-row"><span>Name</span><strong>{user?.fullName}</strong></div>
        <div className="profile-row"><span>Email</span><strong>{user?.email}</strong></div>
        <div className="profile-row"><span>Role</span><strong>{user?.role}</strong></div>

        <button type="button" className="btn btn-secondary">Edit Profile</button>
      </div>
    </div>
  );
}
