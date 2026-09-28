import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') === 'trainer' ? 'trainer' : 'learner',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await register(formData.fullName, formData.email, formData.password, formData.role);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    const dashboardPaths = { learner: '/learner', trainer: '/trainer', admin: '/admin' };
    navigate(dashboardPaths[result.user.role] || '/learner');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Join the movement</p>
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Smith"
            />
            {errors.fullName && <small>{errors.fullName}</small>}
          </label>

          <label>
            <span>Account type</span>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="learner">Learner</option>
              <option value="trainer">Trainer</option>
            </select>
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          <label>
            <span>Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
            />
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </label>

          {serverError && <p className="error-text">{serverError}</p>}

          <button type="submit" className="btn btn-primary full-width">Create Account</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
