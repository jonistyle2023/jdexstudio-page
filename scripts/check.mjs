import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { siteConfig, validCalendarUrl, validEmail } from '../src/site-config.js';

for (const url of ['https://calendar.app.google/example', 'https://calendar.google.com/calendar/appointments/schedules/example']) {
  assert.equal(validCalendarUrl(url), url);
}
for (const url of ['', 'javascript:alert(1)', 'http://calendar.app.google/example', 'https://calendar.app.google.evil.test/', 'https://evil.test/', 'https://user:secret@calendar.google.com/']) {
  assert.equal(validCalendarUrl(url), null, `Reject unsafe calendar URL: ${url}`);
}
assert.equal(validEmail('contacto@example.com'), 'contacto@example.com');
for (const email of ['', 'not-an-email', 'a@b', 'a@b.com?subject=x', 'a@b.com\nbcc:other@example.com']) {
  assert.equal(validEmail(email), null);
}
if (siteConfig.calendarUrl) assert.ok(validCalendarUrl(siteConfig.calendarUrl), 'Invalid configured calendar URL');
if (siteConfig.email) assert.ok(validEmail(siteConfig.email), 'Invalid configured email address');

const root = resolve('dist');
await access(resolve(root, 'assets/facebook_cover.png'));
const home = await readFile(resolve(root, 'index.html'), 'utf8');
assert.match(home, /name="generator" content="Astro/, 'Build must come from Astro, not stale Vite output');
const canonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1];
const basePath = canonical ? new URL(canonical).pathname : '/';
function localResource(value, currentFile = 'index.html') {
  let pathname = value.split('#')[0].split('?')[0];
  let target;
  if (pathname.startsWith('/')) {
    assert.ok(pathname.startsWith(basePath), `Resource outside configured base: ${value}`);
    pathname = pathname.slice(basePath.length);
    target = resolve(root, pathname);
  } else target = resolve(root, dirname(currentFile), pathname);
  if (!pathname || pathname.endsWith('/')) target = resolve(target, 'index.html');
  assert.ok(target.startsWith(root + sep), `Resource must stay inside dist: ${value}`);
  return target;
}

const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (canonical) {
  const image = home.match(/property="og:image" content="([^"]+)"/)?.[1];
  assert.equal(image, new URL('assets/facebook_cover.png', canonical).href, 'Social preview needs an absolute image URL');
  assert.ok(!home.includes('noindex'), 'Published home must be indexable');
  assert.ok(robots.includes(`Sitemap: ${canonical}sitemap.xml`));
  assert.ok((await readFile(resolve(root, 'sitemap.xml'), 'utf8')).includes(`<loc>${canonical}</loc>`));
} else {
  assert.ok(home.includes('noindex, nofollow'), 'Preview must not be indexed');
  assert.ok(robots.includes('Disallow: /'));
}
for (const file of ['index.html', 'privacidad.html']) {
  const html = await readFile(resolve(root, file), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: exactly one h1`);
  assert.match(html, /<html\b[^>]*\blang="es"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    assert.ok(value && value !== '#', `${file}: empty link`);
    if (value.startsWith('#')) {
      assert.ok(ids.includes(value.slice(1)), `${file}: missing anchor ${value}`);
    } else if (!/^(https?:|mailto:|data:)/.test(value)) {
      const [pathname, fragment] = value.split('#');
      const target = localResource(pathname, file);
      await access(target);
      if (fragment) assert.match(await readFile(target, 'utf8'), new RegExp(`id="${fragment}"`));
    }
  }
}

async function checkStyles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await checkStyles(path);
    else if (entry.name.endsWith('.css')) {
      const css = await readFile(path, 'utf8');
      for (const [, value] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
        if (/^(data:|https?:)/.test(value)) continue;
        const resource = value.startsWith('/') ? localResource(value) : resolve(dirname(path), value);
        await access(resource);
      }
    }
  }
}
await checkStyles(root);

function luminance(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
for (const [foreground, background] of [['#17212a', '#ffffff'], ['#586979', '#ffffff'], ['#586979', '#f5f8fa'], ['#ffffff', '#2478c0'], ['#b9c9d5', '#17212a'], ['#edf4f8', '#101820'], ['#b2c3d0', '#16232e'], ['#79bdf1', '#1a2a36']]) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  assert.ok(ratio >= 4.5, `Text contrast ${foreground}/${background}: ${ratio.toFixed(2)}`);
}

console.log('Checks passed: contact validation, build resources, page anchors, headings and primary text contrast.');
if (!siteConfig.calendarUrl || !siteConfig.email) console.log('Pending launch data: configure calendarUrl and email in src/site-config.js.');
