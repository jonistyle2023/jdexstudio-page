/** Public contact details only. Never put credentials or private calendar links here. */
export const siteConfig = {
  // Example format: https://calendar.app.google/your-public-booking-link
  calendarUrl: '',
  email: '',
};

export function validCalendarUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const allowedHosts = ['calendar.app.google', 'calendar.google.com'];
    if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname) || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function validEmail(value) {
  return typeof value === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[\r\n?#]/.test(value) ? value : null;
}
