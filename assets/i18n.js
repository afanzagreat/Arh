(function () {
  'use strict';
  const locales = window.ARH_LOCALES || {};
  const supported = ['en', 'ar', 'fr', 'hi'];
  // A shared URL must retain its rendered language, regardless of old preferences.
  const root = document.documentElement;
  let current = supported.includes(root.lang) ? root.lang : 'en';
  function pagePath(language) {
    const prefix = language === 'en' ? '/' : '/' + language + '/';
    return prefix + ({ works: 'works.html', privacy: 'privacy.html' }[root.dataset.pageKind] || '');
  }
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
      try { localStorage.setItem('arh-lang', language); } catch (_) {}
      if (language !== current) {
        const destination = new URL(pagePath(language), location.origin);
        destination.search = location.search;
        destination.hash = location.hash;
        location.assign(destination.href);
        return true;
      }
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
  let themeSwitching = false;
  document.addEventListener?.('click', event => {
    const button = event.target instanceof Element
      ? event.target.closest('button#themeBtn, button#theme')
      : null;
    if (!button || !event.isTrusted || typeof document.startViewTransition !== 'function' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (themeSwitching) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const rect = button.getBoundingClientRect();
    const x = Math.min(width, Math.max(0, event.detail === 0 ? rect.left + rect.width / 2 : event.clientX));
    const y = Math.min(height, Math.max(0, event.detail === 0 ? rect.top + rect.height / 2 : event.clientY));
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 1.035 + 32;
    const pointCount = 48;
    const start = Array(pointCount).fill(`${Math.round(x)}px ${Math.round(y)}px`).join(', ');
    const end = Array.from({ length: pointCount }, (_, index) => {
      const angle = (index / pointCount) * Math.PI * 2;
      const ripple = 1 + 0.012 * Math.sin(angle * 3 + 0.7) + 0.006 * Math.sin(angle * 7 - 0.4);
      const distance = radius * ripple;
      return `${Math.round(x + Math.cos(angle) * distance)}px ${Math.round(y + Math.sin(angle) * distance)}px`;
    }).join(', ');
    root.style.setProperty('--theme-wipe-start', start);
    root.style.setProperty('--theme-wipe-end', end);
    root.dataset.themeReveal = 'true';
    themeSwitching = true;

    let updated = false;
    const updateTheme = () => {
      const dark = root.dataset.theme !== 'dark';
      root.dataset.theme = dark ? 'dark' : '';
      button.textContent = dark ? '☀️' : '🌙';
      try { localStorage.setItem('arh-theme', dark ? 'dark' : 'light'); } catch (_) {}
      updated = true;
    };
    const cleanup = () => {
      delete root.dataset.themeReveal;
      root.style.removeProperty('--theme-wipe-start');
      root.style.removeProperty('--theme-wipe-end');
      themeSwitching = false;
    };
    try {
      const transition = document.startViewTransition(updateTheme);
      transition.finished.catch(() => {}).finally(cleanup);
    } catch (_) {
      if (!updated) updateTheme();
      cleanup();
    }
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
