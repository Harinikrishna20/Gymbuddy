import { Link } from 'react-router-dom';

export default function Button({ children, to, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) {
  const classNames = `btn btn-${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classNames} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
