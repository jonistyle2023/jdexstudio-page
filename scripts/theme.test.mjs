import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/theme-bootstrap.js', import.meta.url), 'utf8');
function browser({ saved = null, systemDark = false, storageBlocked = false } = {}) {
  const events = {};
  const root = { dataset: {} };
  const attributes = {};
  const meta = {};
  const values = new Map(saved === null ? [] : [['jdexstudio-theme', saved]]);
  class Element {
    closest(selector) { return selector === '[data-theme-toggle]' ? this : null; }
    setAttribute(key, value) { attributes[key] = value; }
  }
  const button = new Element();
  button.hidden = true;
  const system = { matches: systemDark, addEventListener: (name, handler) => { events.system = handler; } };
  const document = {
    documentElement: root,
    querySelector: () => ({ setAttribute: (key, value) => { meta[key] = value; } }),
    querySelectorAll: () => [button],
    addEventListener: (name, handler) => { events[name] = handler; },
  };
  const window = {
    matchMedia: () => system,
    localStorage: {
      getItem: (key) => { if (storageBlocked) throw new Error('blocked'); return values.get(key) ?? null; },
      setItem: (key, value) => { if (storageBlocked) throw new Error('blocked'); values.set(key, value); },
    },
    addEventListener: (name, handler) => { events[name] = handler; },
  };
  runInNewContext(source, { document, window, Element });
  return {
    root, button, attributes, meta, values,
    click: () => events.click({ target: button }),
    systemChange: (dark) => { system.matches = dark; events.system(); },
    storageChange: (value) => events.storage({ key: 'jdexstudio-theme', newValue: value }),
  };
}

test('first visit follows the system and applies theme before rendering', () => {
  const b = browser({ systemDark: true });
  assert.equal(b.root.dataset.theme, 'dark');
  assert.equal(b.meta.content, '#101820');
  assert.equal(b.button.hidden, false);
  assert.equal(b.attributes['aria-label'], 'Activar modo claro');
  b.systemChange(false);
  assert.equal(b.root.dataset.theme, 'light');
});

test('explicit choice persists across pages and overrides system changes', () => {
  const b = browser({ systemDark: true });
  b.click();
  assert.equal(b.root.dataset.theme, 'light');
  assert.equal(b.values.get('jdexstudio-theme'), 'light');
  b.systemChange(true);
  assert.equal(b.root.dataset.theme, 'light');
  const nextPage = browser({ saved: b.values.get('jdexstudio-theme'), systemDark: true });
  assert.equal(nextPage.root.dataset.theme, 'light');
  nextPage.click();
  assert.equal(nextPage.root.dataset.theme, 'dark');
  assert.equal(nextPage.attributes['aria-pressed'], 'true');
});

test('unavailable storage does not break switching', () => {
  const b = browser({ storageBlocked: true });
  assert.equal(b.root.dataset.theme, 'light');
  assert.doesNotThrow(() => b.click());
  assert.equal(b.root.dataset.theme, 'dark');
  b.systemChange(false);
  assert.equal(b.root.dataset.theme, 'dark');
});

test('invalid stored values are ignored and other tabs synchronize', () => {
  const b = browser({ saved: 'invalid', systemDark: true });
  assert.equal(b.root.dataset.theme, 'dark');
  b.storageChange('light');
  assert.equal(b.root.dataset.theme, 'light');
  b.storageChange(null);
  assert.equal(b.root.dataset.theme, 'dark');
});
