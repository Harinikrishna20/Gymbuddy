import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const activityCategories = [
  'Fitness', 'Yoga', 'Dance', 'Badminton', 'Cricket', 'Football',
  'Basketball', 'Swimming', 'Zumba', 'Meditation', 'Other',
];

const blankClass = {
  title: '',
  description: '',
  category: 'Fitness',
  trainer: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  capacity: 20,
};

export default function ManageClasses() {
  const {
    user,
    classes,
    myClasses,
    classesLoading,
    classesError,
    dataLoading,
    dataError,
    refreshClasses,
    addClass,
    updateClass,
    deleteClass,
  } = useAuth();
  const isTrainer = user?.role === 'trainer';
  const managedClasses = isTrainer ? myClasses : classes;
  const pageLoading = isTrainer ? dataLoading : classesLoading;
  const pageError = isTrainer ? dataError : classesError;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(blankClass);
  const [formError, setFormError] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSaveClass = async (event) => {
    event.preventDefault();

    const result = editingId
      ? await updateClass(editingId, { ...formData, capacity: Number(formData.capacity) })
      : await addClass({ ...formData, capacity: Number(formData.capacity) });

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    setFormError('');
    setEditingId(null);
    setFormData(blankClass);
    setShowForm(false);
  };

  const handleEdit = (classItem) => {
    setEditingId(classItem.id);
    setFormData({
      title: classItem.title,
      description: classItem.description,
      category: classItem.category,
      trainer: classItem.trainer,
      date: classItem.date,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      location: classItem.location,
      capacity: classItem.capacity,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteClass(id);
    setFormError(result.success ? '' : result.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(blankClass);
    setFormError('');
    setShowForm(false);
  };

  return (
    <div className="container page-shell">
      <div className="section-heading split">
        <div>
          <p className="eyebrow">{isTrainer ? 'Trainer tools' : 'Platform administration'}</p>
          <h1>{isTrainer ? 'My Classes' : 'Manage Classes'}</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { setEditingId(null); setFormData(blankClass); setFormError(''); setShowForm(true); }}>
          Create Class
        </button>
      </div>

      {pageError && (
        <p className="error-text" role="alert">
          {pageError}{' '}
          {!isTrainer && <button type="button" className="text-link" onClick={refreshClasses}>Retry</button>}
        </p>
      )}
      {formError && <p className="error-text" role="alert">{formError}</p>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSaveClass}>
          <div className="form-grid">
            <label>
              <span>Class Name</span>
              <input name="title" value={formData.title} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Description</span>
              <input name="description" value={formData.description} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Activity</span>
              <select name="category" value={formData.category} onChange={handleInputChange} required>
                {[...new Set([...activityCategories, formData.category])].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            {isTrainer ? (
              <label><span>Trainer</span><input value={user.fullName} readOnly /></label>
            ) : (
              <label>
                <span>Trainer name</span>
                <input name="trainer" value={formData.trainer} onChange={handleInputChange} required />
              </label>
            )}
            <label>
              <span>Date</span>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Start Time</span>
              <input name="startTime" value={formData.startTime} onChange={handleInputChange} required />
            </label>
            <label>
              <span>End Time</span>
              <input name="endTime" value={formData.endTime} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Location</span>
              <input name="location" value={formData.location} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Capacity</span>
              <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Class'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Trainer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Booked</th>
              <th>Seats available</th>
              {isTrainer && <th>Roster</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={isTrainer ? 9 : 8}>Loading classes...</td></tr>
            ) : managedClasses.map((classItem) => (
              <tr key={classItem.id}>
                <td>{classItem.title}</td>
                <td>{classItem.trainer}</td>
                <td>{classItem.date}</td>
                <td>{classItem.startTime} - {classItem.endTime}</td>
                <td>{classItem.capacity}</td>
                <td>{classItem.bookedSeats}</td>
                <td>{classItem.availableSeats}</td>
                {isTrainer && <td><Link className="text-link" to={`/trainer/classes/${classItem.id}/learners`}>View learners</Link></td>}
                <td>
                  <div className="action-group">
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => handleEdit(classItem)}>Edit</button>
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => handleDelete(classItem.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!pageLoading && managedClasses.length === 0 && (
              <tr><td colSpan={isTrainer ? 9 : 8}>{isTrainer ? 'You have not created any classes yet.' : 'No classes have been added.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
