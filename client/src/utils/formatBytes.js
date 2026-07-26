export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) {
    return '0 KB';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024;
    unitIndex++;
  }
  return value.toFixed(unitIndex === 0 ? 0 : 1) + ' ' + units[unitIndex];
}
