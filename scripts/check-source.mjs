import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { normalizeSiteUrl } from '../src/lib/site-url.js';
import { assetUrl, pageUrl } from '../src/lib/urls.js';
import { GET as robots } from '../src/pages/robots.txt.js';
import { GET as sitemap } from '../src/pages/sitemap.xml.js';
import { team } from '../src/data/team.js';
import { teamImageIsReady } from '../src/lib/team-photo.js';

assert.equal(normalizeSiteUrl(''), null);
assert.equal(normalizeSiteUrl('https://example.com/studio').href, 'https://example.com/studio/');
for (const value of ['http://example.com', 'https://user:secret@example.com', 'https://example.com/?secret=1', 'https://example.com/#fragment']) {
  assert.throws(() => normalizeSiteUrl(value));
}
assert.equal(assetUrl('/assets/logo/logo-claro.svg'), '/assets/logo/logo-claro.svg');
assert.equal(pageUrl('privacidad.html'), '/privacidad.html');
assert.equal(await robots({ site: undefined }).text(), 'User-agent: *\nDisallow: /\n');
const site = new URL('https://example.com/studio/');
assert.ok((await robots({ site }).text()).includes('Sitemap: https://example.com/studio/sitemap.xml'));
assert.ok((await sitemap({ site }).text()).includes('<loc>https://example.com/studio/</loc>'));
assert.ok(!(await sitemap({ site: undefined }).text()).includes('<loc>'));

async function checkAstroImports(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) count += await checkAstroImports(path);
    else if (entry.name.endsWith('.astro')) {
      const source = await readFile(path, 'utf8');
      for (const [, target] of source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
        if (target.startsWith('.')) await access(resolve(dirname(path), target.split('?')[0]));
      }
      count += 1;
    }
  }
  return count;
}
const count = await checkAstroImports(resolve('src'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
assert.ok(packageJson.dependencies.astro);
assert.equal(packageJson.scripts.build, 'astro build');
assert.ok((await readFile('src/layouts/SiteLayout.astro', 'utf8')).includes('Astro.generator'));
assert.equal(team.length, 3);
for (const member of team) await access(resolve('assets/team', member.photo));
const pendingPhotos = team.filter((member) => !teamImageIsReady(member.photo));
console.log(`Source checks passed: ${count} Astro files, local imports, URL configuration and static SEO endpoints.`);
if (pendingPhotos.length) console.log(`Pending real portraits (currently placeholders): ${pendingPhotos.map((member) => member.name).join(', ')}.`);
console.log('Template compilation is covered separately by npm run build.');
