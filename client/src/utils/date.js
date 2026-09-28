export const formatDateLabel = (dateString) => {
  if (!dateString) return 'N/A';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateString}T00:00:00`));
};