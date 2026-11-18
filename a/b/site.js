(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('themeToggle');
  const themeWord = themeButton?.querySelector('.theme-word');
  const sampleCopy = {
    calls: {
      label: 'A direct line, made easy',
      title: 'Make calling the easy part.',
      copy: 'Show the service, the location, and when you’re available.',
      action: 'Call the business'
    },
    bookings: {
      label: 'A visit, without the friction',
      title: 'Let the right visit book itself.',
      copy: 'Put the details and booking action where people expect them.',
      action: 'Book your visit'
    },
    enquiries: {
      label: 'A clearer next step',
      title: 'Make the next step feel simple.',
      copy: 'Explain what you do, who it helps, and how to start a conversation.',
      action: 'Send an enquiry'
    }
  };

  function setTheme(theme) {
    root.dataset.theme = theme;
    if (!themeButton) return;
    const isDark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    if (themeWord) themeWord.textContent = isDark ? 'Dark' : 'Light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#17221c' : '#f5f1e7');
    try { localStorage.setItem('arh-b-theme', theme); } catch (_) {}
  }

  try {
    const saved = localStorage.getItem('arh-b-theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  } catch (_) {}
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  document.querySelectorAll('[data-goal]').forEach(button => {
    button.addEventListener('click', () => {
      const item = sampleCopy[button.dataset.goal];
      if (!item) return;
      document.querySelectorAll('[data-goal]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      document.getElementById('sampleLabel').textContent = item.label;
      document.getElementById('sampleTitle').textContent = item.title;
      document.getElementById('sampleCopy').textContent = item.copy;
      document.getElementById('sampleCta').firstChild.textContent = item.action + ' ';
    });
  });

  document.querySelectorAll('[data-billing]').forEach(button => {
    button.addEventListener('click', () => {
      const billing = button.dataset.billing;
      document.querySelectorAll('[data-billing]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      document.querySelectorAll('.price strong[data-monthly]').forEach(price => {
        price.textContent = price.dataset[billing];
      });
      document.querySelectorAll('.price [data-period]').forEach(period => {
        period.textContent = billing === 'monthly' ? '/ month' : 'one-time';
      });
    });
  });

  const menu = document.querySelector('.mobile-nav');
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
})();
