import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassCard from '../components/ClassCard';
import { useAuth } from '../context/AuthContext';

export default function Classes() {
  const navigate = useNavigate();
  const { classes, classesLoading, classesError, refreshClasses } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [trainer, setTrainer] = useState('All');
  const [date, setDate] = useState('');

  const uniqueCategories = ['All', ...new Set(classes.map((item) => item.category))];
  const uniqueTrainers = ['All', ...new Set(classes.map((item) => item.trainer))];

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || item.category === category;
      const matchesTrainer = trainer === 'All' || item.trainer === trainer;
      const matchesDate = !date || item.date === date;

      return matchesSearch && matchesCategory && matchesTrainer && matchesDate;
    });
  }, [classes, search, category, trainer, date]);

  const handleBook = (classItem) => {
    navigate(`/classes/${classItem.id}`);
  };

  return (
    <div className="container page-shell">
      <div className="section-heading">
        <p className="eyebrow">Find your perfect fit</p>
        <h1>Available Gym Classes</h1>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search classes"
        />

        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {uniqueCategories.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <select value={trainer} onChange={(event) => setTrainer(event.target.value)}>
          {uniqueTrainers.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {classesError && (
        <div className="error-text" role="alert">
          {classesError}{' '}
          <button type="button" className="text-link" onClick={refreshClasses}>Retry</button>
        </div>
      )}

      <div className="class-grid">
        {classesLoading ? (
          <div className="empty-state" role="status">Loading classes...</div>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((item) => (
            <ClassCard key={item.id} classItem={item} showBookButton onBook={handleBook} />
          ))
        ) : (
          <div className="empty-state">
            {classes.length === 0 ? 'No gym classes are currently scheduled.' : 'No classes match your current filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
