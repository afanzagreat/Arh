'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/contact-form.js'), 'utf8');
const PLAN_VALUES = ['monthly_essential', 'monthly_pro_max', 'monthly_custom', 'once_essential', 'once_pro_max', 'once_custom', 'unsure'];
let cases = 0;
function element(props = {}) {
  return Object.assign({listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }}, props);
}
function fixture(project = 'New website') {
  const nodes = {
    contactForm: element(), projectType: element({value: project}),
    existingWebsiteField: element({hidden: true}),
    existingWebsite: element({value: '', disabled: true, required: false}),
    budget: element({value: 'monthly_essential', options: PLAN_VALUES.map(value => ({value}))})
  };
  const links = PLAN_VALUES.slice(0, 6).map(value => element({dataset: {plan: value}}));
  const window = element();
  vm.runInNewContext(source, {document: {getElementById(id) { return nodes[id]; }, querySelectorAll() { return links; }}, window}, {timeout: 1000});
  return {nodes, links, window};
}
function expectState(f, visible, value = '') {
  assert.equal(f.nodes.existingWebsiteField.hidden, !visible);
  assert.equal(f.nodes.existingWebsite.disabled, !visible);
  assert.equal(f.nodes.existingWebsite.required, visible);
  assert.equal(f.nodes.existingWebsite.value, value);
}
for (const project of ['New website', 'Online store / booking', 'Something else']) {
  const f = fixture(project);
  expectState(f, false); cases++;
  f.nodes.projectType.value = 'Redesign existing site';
  f.nodes.projectType.listeners.change();
  expectState(f, true); cases++;
  f.nodes.existingWebsite.value = 'https://example.com/original';
  f.nodes.projectType.value = project;
  f.nodes.projectType.listeners.change();
  expectState(f, false); cases++;
  f.nodes.projectType.value = 'Redesign existing site';
  f.nodes.projectType.listeners.change();
  expectState(f, true); cases++;
}
{
  const f = fixture('Redesign existing site');
  expectState(f, true); cases++;
  f.nodes.existingWebsite.value = 'https://example.com';
  f.nodes.contactForm.listeners.reset();
  expectState(f, false); cases++;
}
for (const project of ['New website', 'Redesign existing site']) {
  const f = fixture();
  f.nodes.projectType.value = project;
  f.nodes.existingWebsite.value = 'https://example.com/restored';
  f.window.listeners.pageshow();
  expectState(f, project === 'Redesign existing site', project === 'Redesign existing site' ? 'https://example.com/restored' : '');
  cases++;
}
{
  const f = fixture();
  f.nodes.projectType.value = 'Redesign existing site';
  f.nodes.projectType.listeners.change();
  f.nodes.existingWebsite.value = 'https://example.com/keep';
  for (const link of f.links) {
    link.listeners.click();
    assert.equal(f.nodes.budget.value, link.dataset.plan);
    expectState(f, true, 'https://example.com/keep');
    cases++;
  }
}
{
  vm.runInNewContext(source, {document: {getElementById() { return null; }}}, {timeout: 1000});
  cases++;
}
console.log(`PASS: ${cases} contact-form runtime cases (conditional reveal, hidden/disabled clearing, required state, reset, restored forms, six CTA mappings and missing-form guard).`);
