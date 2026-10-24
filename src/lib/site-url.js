export function normalizeSiteUrl(value = '') {
  if (!value.trim()) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.search || url.hash || url.username || url.password) {
    throw new Error('PUBLIC_SITE_URL debe ser una URL HTTPS pública sin credenciales, consulta ni fragmento.');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}
