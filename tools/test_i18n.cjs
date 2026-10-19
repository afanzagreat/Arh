'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/i18n.js'), 'utf8');
const languages = ['en', 'ar', 'fr', 'hi'];
let cases = 0;
function environment(language, kind, blockedStorage = false) {
  let destination = null;
  const root = {lang: language, dir: language === 'ar' ? 'rtl' : 'ltr', dataset: {pageKind: kind}};
  const select = {value: language, addEventListener() {}};
  const catalogs = Object.fromEntries(languages.map(lang => [lang, {pageTitle: lang + ' title', pageDescription: lang + ' description'}]));
  const context = {
    URL, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    window: {ARH_LOCALES: catalogs, dispatchEvent() {}},
    document: {documentElement: root, readyState: 'complete', title: '', querySelectorAll() { return []; }, querySelector() { return null; }, getElementById() { return select; }},
    location: {origin: 'https://arhdesign.tech', search: '?utm_source=review', hash: kind === 'home' ? '#pricing' : '', assign(value) { destination = value; }},
    localStorage: {getItem() { if (blockedStorage) throw Error('Storage blocked'); return 'hi'; }, setItem() { if (blockedStorage) throw Error('Storage blocked'); }}
  };
  vm.runInNewContext(source, context, {timeout: 1000});
  return {context, get destination() { return destination; }};
}
for (const kind of ['home', 'works']) {
  for (const from of languages) {
    for (const to of languages) {
      const env = environment(from, kind);
      assert.equal(env.context.window.ARHI18n.language, from, 'Explicit page language must beat an old saved preference');
      assert.equal(env.context.window.ARHI18n.setLanguage(to), true);
      if (from === to) assert.equal(env.destination, null, 'No reload when selecting the current language');
      else {
        const expected = new URL((to === 'en' ? '/' : '/' + to + '/') + (kind === 'works' ? 'works.html' : ''), 'https://arhdesign.tech');
        expected.search = '?utm_source=review';
        expected.hash = kind === 'home' ? '#pricing' : '';
        assert.equal(env.destination, expected.href);
      }
      cases++;
    }
  }
}
for (const kind of ['home', 'works']) {
  for (const language of languages) {
    const env = environment(language, kind, true);
    assert.equal(env.context.window.ARHI18n.language, language);
    assert.equal(env.context.document.documentElement.dir, language === 'ar' ? 'rtl' : 'ltr');
    assert.equal(env.context.window.ARHI18n.setLanguage('xx'), false);
    assert.equal(env.destination, null);
    const target = language === 'ar' ? 'en' : 'ar';
    assert.equal(env.context.window.ARHI18n.setLanguage(target), true);
    assert.ok(env.destination);
    cases++;
  }
}
console.log(`PASS: ${cases} language-runtime cases (all page/language transitions, same-language no-op, URL precedence, query/hash retention, invalid language and blocked storage).`);
