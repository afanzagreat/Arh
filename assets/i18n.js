(function () {
  'use strict';
  const locales = window.ARH_LOCALES || {};
  const supported = ['en', 'ar', 'fr', 'hi'];
  let current = 'en';
  try {
    const saved = localStorage.getItem('arh-lang');
    if (supported.includes(saved)) current = saved;
  } catch (_) {}
  function t(key) {
    return locales[current]?.[key] ?? locales.en?.[key] ?? key;
  }
  function apply() {
    const root = document.documentElement;
    root.lang = current;
    root.dir = current === 'ar' ? 'rtl' : 'ltr';
    root.dataset.lang = current;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.i18n) el.innerHTML = t(el.dataset.i18n);
    });
    for (const attr of ['placeholder', 'aria-label', 'title', 'content']) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(el => {
        el.setAttribute(attr, t(el.getAttribute('data-i18n-' + attr)));
      });
    }
    document.title = t('pageTitle');
    const metadata = {
      'meta[name="description"]': 'pageDescription',
      'meta[property="og:title"]': 'pageTitle',
      'meta[name="twitter:title"]': 'pageTitle',
      'meta[property="og:description"]': 'pageDescription',
      'meta[name="twitter:description"]': 'pageDescription',
      'meta[property="og:locale"]': 'ogLocale'
    };
    for (const [selector, key] of Object.entries(metadata)) {
      const el = document.querySelector(selector);
      if (el) el.content = t(key);
    }
    const select = document.getElementById('languageSelect');
    if (select) select.value = current;
    try { localStorage.setItem('arh-lang', current); } catch (_) {}
    window.dispatchEvent(new CustomEvent('arh:languagechange', { detail: { language: current } }));
  }
  window.ARHI18n = {
    t,
    setLanguage(language) {
      if (!supported.includes(language)) return false;
      current = language;
      apply();
      return true;
    },
    get language() { return current; }
  };
  function init() {
    document.getElementById('languageSelect')?.addEventListener('change', event => {
      window.ARHI18n.setLanguage(event.target.value);
    });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
