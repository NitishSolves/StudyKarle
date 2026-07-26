export function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatRelativeTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return diffMinutes + (diffMinutes === 1 ? ' minute ago' : ' minutes ago');
  }
  if (diffHours < 24) {
    return diffHours + (diffHours === 1 ? ' hour ago' : ' hours ago');
  }
  if (diffDays < 7) {
    return diffDays + (diffDays === 1 ? ' day ago' : ' days ago');
  }
  return formatDate(value);
}
