export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!n || n <= 0) {
    return '0 KB';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024;
    unitIndex++;
  }
  return value.toFixed(unitIndex === 0 ? 0 : 1) + ' ' + units[unitIndex];
}
