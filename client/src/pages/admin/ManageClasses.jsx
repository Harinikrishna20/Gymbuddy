import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const blankClass = {
  title: '',
  description: '',
  category: '',
  trainer: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  capacity: 20,
};

export default function ManageClasses() {
  const { classes, classesLoading, classesError, refreshClasses, addClass, updateClass, deleteClass } = useAuth();
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
          <p className="eyebrow">Admin tools</p>
          <h1>Manage Classes</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { setEditingId(null); setFormData(blankClass); setFormError(''); setShowForm(true); }}>
          + Add New Class
        </button>
      </div>

      {classesError && (
        <p className="error-text" role="alert">
          {classesError}{' '}
          <button type="button" className="text-link" onClick={refreshClasses}>Retry</button>
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
              <span>Category</span>
              <input name="category" value={formData.category} onChange={handleInputChange} required />
            </label>
            <label>
              <span>Trainer</span>
              <input name="trainer" value={formData.trainer} onChange={handleInputChange} required />
            </label>
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
              <th>Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classesLoading ? (
              <tr><td colSpan="7">Loading classes...</td></tr>
            ) : classes.map((classItem) => (
              <tr key={classItem.id}>
                <td>{classItem.title}</td>
                <td>{classItem.trainer}</td>
                <td>{classItem.date}</td>
                <td>{classItem.startTime} - {classItem.endTime}</td>
                <td>{classItem.capacity}</td>
                <td>{classItem.bookedSeats}</td>
                <td>
                  <div className="action-group">
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => handleEdit(classItem)}>Edit</button>
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => handleDelete(classItem.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!classesLoading && classes.length === 0 && (
              <tr><td colSpan="7">No classes have been added.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
