const configuredBase = import.meta.env?.BASE_URL || '/';
const base = `${configuredBase.replace(/\/+$/, '')}/`;

export function assetUrl(path) {
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function pageUrl(path = '') {
  return `${base}${path.replace(/^\/+/, '')}`;
}
