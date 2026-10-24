export const prerender = true;

export function GET({ site }) {
  const home = site ? `${site.href.replace(/\/$/, '')}/` : null;
  return new Response(home
    ? `User-agent: *\nAllow: /\nSitemap: ${home}sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
