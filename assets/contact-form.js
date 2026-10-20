(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  const projectType = document.getElementById('projectType');
  const websiteField = document.getElementById('existingWebsiteField');
  const website = document.getElementById('existingWebsite');
  const plan = document.getElementById('budget');
  if (!form || !projectType || !websiteField || !website || !plan) return;

  function setWebsiteVisible(visible) {
    websiteField.hidden = !visible;
    website.disabled = !visible;
    website.required = visible;
    if (!visible) website.value = '';
  }

  function syncProjectType() {
    setWebsiteVisible(projectType.value === 'Redesign existing site');
  }

  projectType.addEventListener('change', syncProjectType);
  // The reset event fires before the browser restores default control values.
  // The default project is New website, so hide and clear immediately.
  form.addEventListener('reset', function () { setWebsiteVisible(false); });
  window.addEventListener('pageshow', syncProjectType);

  document.querySelectorAll('a[data-plan]').forEach(function (link) {
    link.addEventListener('click', function () {
      const value = link.dataset.plan;
      if (Array.from(plan.options).some(function (option) { return option.value === value; })) {
        plan.value = value;
      }
    });
  });

  syncProjectType();
}());
