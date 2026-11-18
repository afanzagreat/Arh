'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/i18n.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../assets/i18n.css'), 'utf8');
let cases = 0;
function fixture({dark = false, reduced = false, api = true, failure = '', blockedStorage = false} = {}) {
  const listeners = {}, styles = new Map(), stored = new Map(), attrs = {};
  const root = {lang: 'en', dir: 'ltr', dataset: {pageKind: 'home', theme: dark ? 'dark' : ''}, style: {
    setProperty(k, v) { styles.set(k, v); }, removeProperty(k) { styles.delete(k); }
  }};
  class Element {
    closest() { return this; }
    getBoundingClientRect() { return {left: 800, top: 60, width: 44, height: 44}; }
    setAttribute(k, v) { attrs[k] = v; }
  }
  const button = new Element(); button.textContent = dark ? '☀️' : '🌙';
  button.onclick = () => { throw Error('Legacy handler must be retired'); };
  let calls = 0, resolve, reject;
  const document = {
    documentElement: root, readyState: 'complete', title: '',
    querySelectorAll(selector) { return selector === 'button#themeBtn, button#theme' ? [button] : []; },
    querySelector() { return null; }, getElementById() { return null; },
    addEventListener(name, fn, capture) { listeners[name] = {fn, capture}; }
  };
  if (api) document.startViewTransition = update => {
    calls++;
    if (failure === 'throw-before') throw Error('Unavailable');
    if (failure !== 'reject-before') update();
    if (failure === 'throw-after') throw Error('Already updated');
    return {ready: failure ? Promise.reject(Error('Skipped')) : Promise.resolve(),
      finished: new Promise((yes, no) => { resolve = yes; reject = no; })};
  };
  const window = {innerWidth: 1000, innerHeight: 700, ARH_LOCALES: {en: {}}, dispatchEvent() {},
    matchMedia() { return {matches: reduced}; }};
  vm.runInNewContext(source, {document, window, Element, URL,
    CustomEvent: class {}, location: {origin: 'https://arhdesign.tech'},
    localStorage: {setItem(k, v) { if (blockedStorage) throw Error('Blocked'); stored.set(k, v); }}
  }, {timeout: 1000});
  assert.equal(button.onclick, null);
  function click({keyboard = false, child = false, trusted = true, x = 822, y = 82} = {}) {
    let prevented = false, stopped = false;
    const target = child ? Object.assign(new Element(), {closest() { return button; }}) : button;
    listeners.click.fn({target, isTrusted: trusted, detail: keyboard ? 0 : 1, clientX: x, clientY: y,
      preventDefault() { prevented = true; }, stopImmediatePropagation() { stopped = true; }});
    assert.equal(prevented, false); assert.equal(stopped, false);
  }
  return {root, button, styles, stored, attrs, listeners, click,
    get calls() { return calls; }, finish() { resolve(); }, fail() { reject(Error('Skipped')); }};
}
const settle = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  for (const dark of [false, true]) {
    const f = fixture({dark, api: false});
    assert.equal(f.attrs['aria-pressed'], String(dark));
    assert.equal(f.listeners.click.capture, true);
    f.click();
    assert.equal(f.root.dataset.theme, dark ? '' : 'dark');
    assert.equal(f.button.textContent, dark ? '🌙' : '☀️');
    assert.equal(f.attrs['aria-pressed'], String(!dark));
    assert.equal(f.stored.get('arh-theme'), dark ? 'light' : 'dark');
    assert.equal(f.styles.size, 0); cases++;
  }
  for (const api of [false, true]) {
    const f = fixture({reduced: true, api}); f.click({keyboard: true});
    assert.equal(f.calls, 0); assert.equal(f.root.dataset.theme, 'dark');
    assert.equal(f.root.dataset.themeReveal, undefined); cases++;
  }
  const synthetic = fixture(); synthetic.click({trusted: false});
  assert.equal(synthetic.calls, 0); assert.equal(synthetic.root.dataset.theme, 'dark');
  assert.equal(synthetic.stored.get('arh-theme'), 'dark'); cases++;
  for (const keyboard of [false, true]) {
    const f = fixture(); f.click({keyboard, child: true});
    assert.equal(f.calls, 1); assert.equal(f.root.dataset.themeReveal, 'true');
    assert.equal(f.styles.get('--theme-reveal-x'), '822px');
    assert.equal(f.styles.get('--theme-reveal-y'), '82px');
    const radius = parseFloat(f.styles.get('--theme-reveal-radius'));
    assert.ok(radius > Math.hypot(822, 618));
    f.click(); assert.equal(f.calls, 1); assert.equal(f.root.dataset.theme, 'dark');
    f.finish(); await settle();
    assert.equal(f.styles.size, 0); assert.equal(f.root.dataset.themeReveal, undefined);
    f.click(); assert.equal(f.calls, 2); assert.equal(f.root.dataset.theme, '');
    f.finish(); await settle(); cases++;
  }
  for (const failure of ['throw-before', 'throw-after', 'reject-before', 'reject-after']) {
    const f = fixture({failure}); f.click();
    if (failure.startsWith('reject')) { f.fail(); await settle(); }
    assert.equal(f.root.dataset.theme, 'dark'); assert.equal(f.attrs['aria-pressed'], 'true');
    assert.equal(f.styles.size, 0); assert.equal(f.root.dataset.themeReveal, undefined); cases++;
  }
  for (const api of [false, true]) {
    const f = fixture({api, blockedStorage: true}); f.click();
    if (api) { f.finish(); await settle(); }
    assert.equal(f.root.dataset.theme, 'dark'); cases++;
  }
  const edge = fixture(); edge.click({x: 2000, y: -30});
  assert.equal(edge.styles.get('--theme-reveal-x'), '1000px');
  assert.equal(edge.styles.get('--theme-reveal-y'), '0px');
  edge.finish(); await settle(); cases++;
  assert.match(css, /arh-theme-reveal 1600ms cubic-bezier\(\.4,0,\.2,1\)/);
  assert.match(css, /clip-path: circle\(0px at/);
  assert.doesNotMatch(css, /theme-wipe|polygon\(var\(--theme/);
  assert.match(css, /view-transition-image-pair\(root\) \{ isolation: isolate;/);
  assert.match(css, /mix-blend-mode: normal/);
  assert.match(css, /html\[data-theme="dark"\] \{ color-scheme: dark/);
  assert.match(css, /\.project:first-child \{ background: var\(--card\)/);
  assert.match(css, /\.pupil \{ background: #111827/);
  assert.match(css, /:focus-visible \{ outline: 3px solid var\(--theme-focus\)/);
  assert.match(css, /:user-invalid/);
  const reducedCSS = css.slice(css.indexOf('/* Reduced motion applies'));
  assert.match(reducedCSS, /prefers-reduced-motion: reduce/);
  assert.match(reducedCSS, /animation: none !important/);
  assert.match(reducedCSS, /transition: none !important/);
  assert.match(reducedCSS, /scroll-behavior: auto !important/); cases++;
  console.log(`PASS: ${cases} theme regression cases (1.6s smooth reveal, both directions, keyboard origin, rapid-click guard, fallback/rejection cleanup, reduced motion, blocked storage, ARIA state, preserved click propagation and dark-theme CSS).`);
})().catch(error => { console.error(error); process.exitCode = 1; });
