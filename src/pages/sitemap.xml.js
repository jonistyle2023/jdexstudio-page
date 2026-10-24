export const prerender = true;

export function GET({ site }) {
  const home = site ? `${site.href.replace(/\/$/, '')}/` : null;
  const escaped = home?.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const entry = escaped ? `<url><loc>${escaped}</loc></url>` : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entry}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
