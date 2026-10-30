import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { normalizeSiteUrl } from './src/lib/site-url.js';

if (existsSync('.env')) loadEnvFile('.env');
const siteUrl = normalizeSiteUrl(process.env.PUBLIC_SITE_URL || '');

export default defineConfig({
  output: 'static',
  site: siteUrl?.href,
  base: siteUrl?.pathname || '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
  server: { host: '127.0.0.1', port: 5173 },
  devToolbar: { enabled: false },
});
