import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// The three supplied JPGs currently contain this same "800x800" placeholder.
// Keep initials until a real photo replaces each file; never publish the marker as a portrait.
const placeholderHash = 'f072095a7b854efc1373a9d0d8a270a44c2d65569fdae15d3e6fc75af8952f4b';
export function teamImageIsReady(filename) {
  if (!['jonathan.jpg', 'jose.jpg', 'jean.jpg'].includes(filename)) return false;
  const image = readFileSync(resolve('assets/team', filename));
  return createHash('sha256').update(image).digest('hex') !== placeholderHash;
}
